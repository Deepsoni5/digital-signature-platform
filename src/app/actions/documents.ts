"use server"

import { v2 as cloudinary } from "cloudinary"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"
import { headers } from "next/headers"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface UploadResponse {
    success: boolean
    error?: string
    data?: any
}

export async function recordDocumentAuditLog({
    documentId,
    eventType,
    actorName,
    actorEmail,
    metadata = {},
    timestamp
}: {
    documentId: string;
    eventType: string;
    actorName?: string;
    actorEmail?: string;
    metadata?: any;
    timestamp?: string;
}) {
    const headerList = await headers();
    let ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || 'unknown';
    const userAgent = headerList.get('user-agent') || 'unknown';

    // Development Helper: If local, try to fetch real public IP for testing
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            if (ipData.ip) ip = ipData.ip;
        } catch (e) {
            console.log("Could not fetch public IP, staying with local.");
        }
    }

    // Fetch Location data from IP
    let location = 'Localhost/Unknown';
    if (ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
        try {
            const locRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country`);
            const locData = await locRes.json();
            if (locData.status === 'success') {
                location = `${locData.city}, ${locData.regionName}, ${locData.country}`;
            }
        } catch (error) {
            console.error("Location fetch failed:", error);
        }
    }

    try {
        await supabase.from('document_audit_logs').insert({
            document_id: documentId,
            event_type: eventType,
            actor_name: actorName || 'System',
            actor_email: actorEmail || 'system@merzvia.com',
            ip_address: ip,
            user_agent: userAgent,
            metadata: { ...metadata, location },
            ...(timestamp && { created_at: timestamp })
        });
    } catch (error) {
        console.error("Failed to record audit log:", error);
    }
}

export async function recordDocumentDownloadAction(documentId: string, documentName: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) return;

    try {
        const { data: userData } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("clerk_id", clerkId)
            .single();

        await recordDocumentAuditLog({
            documentId,
            eventType: 'document_downloaded',
            actorName: userData?.full_name || "User",
            actorEmail: userData?.email || clerkId,
            metadata: { fileName: documentName, trigger: 'dashboard_download' }
        });
    } catch (error) {
        console.error("Failed to log download:", error);
    }
}

export async function uploadSignedDocumentAction(
    formData: FormData
): Promise<UploadResponse> {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
        return { success: false, error: "Unauthorized" }
    }

    const file = formData.get("file") as File
    if (!file) {
        return { success: false, error: "No file provided" }
    }

    const shareCode = formData.get("shareCode") as string | null
    const signedByName = formData.get("signedByName") as string | null

    try {
        // 1. Get the local Supabase user data
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, full_name, email")
            .eq("clerk_id", clerkId)
            .single()

        if (userError || !userData) {
            return { success: false, error: "User profile not found in database" }
        }

        // 2. Convert file to buffer for Cloudinary
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 3. Upload to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `esign_via/signed_documents/${clerkId}`,
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        const cloudinaryResult = (await uploadPromise) as any

        // 4. Insert into Supabase documents table for current user
        const { data: docData, error: docError } = await supabase
            .from("documents")
            .insert({
                user_id: userData.id,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                cloudinary_id: cloudinaryResult.public_id,
                secure_url: cloudinaryResult.secure_url,
                status: "completed",
                signed_by_name: signedByName || null,
                flow_type: shareCode ? 'collaborative' : 'personal'
            })
            .select()
            .single()

        if (docError) {
            console.error("Database insertion error:", docError)
            return { success: false, error: "Failed to save document record" }
        }

        // --- Audit Log: Detailed Full Sequence ---
        const logActor = signedByName || userData?.full_name || "User";
        const logEmail = userData?.email || clerkId;
        const logMeta = { fileName: file.name, flow: shareCode ? 'collaborative' : 'personal' };

        const uploadedAt = formData.get("uploadedAt") as string | null;
        const signedAt = formData.get("signedAt") as string | null;

        // 1. Initial Upload (Back-dated to when user picked the file)
        await recordDocumentAuditLog({
            documentId: docData.id,
            eventType: 'document_uploaded',
            actorName: logActor,
            actorEmail: logEmail,
            metadata: logMeta,
            timestamp: uploadedAt || undefined
        });

        // 2. Verified Signature Applied (Back-dated to when signature was placed)
        await recordDocumentAuditLog({
            documentId: docData.id,
            eventType: shareCode ? 'signed_via_share' : 'personal_document_signed',
            actorName: logActor,
            actorEmail: logEmail,
            metadata: logMeta,
            timestamp: signedAt || undefined
        });

        // 3. Document Delivered/Downloaded (Current Time)
        await recordDocumentAuditLog({
            documentId: docData.id,
            eventType: 'document_downloaded',
            actorName: logActor,
            actorEmail: logEmail,
            metadata: { ...logMeta, delivery: 'instant_browser_download' }
        });

        // 4b. If this was a shared document, also notify/create record for original owner
        if (shareCode) {
            const { data: originalDoc } = await supabase
                .from("documents")
                .select("user_id, file_name")
                .eq("share_code", shareCode)
                .single()

            if (originalDoc && originalDoc.user_id !== userData.id) {
                // Create a record for User 1 (original owner)
                const { data: originalDocData } = await supabase
                    .from("documents")
                    .insert({
                        user_id: originalDoc.user_id,
                        file_name: `[Signed by ${signedByName || 'Guest'}] ${originalDoc.file_name}`,
                        file_size: file.size,
                        file_type: file.type,
                        cloudinary_id: cloudinaryResult.public_id,
                        secure_url: cloudinaryResult.secure_url,
                        status: "completed",
                        signed_by_name: signedByName || null,
                        flow_type: 'collaborative'
                    })
                    .select()
                    .single()

                if (originalDocData) {
                    await recordDocumentAuditLog({
                        documentId: originalDocData.id,
                        eventType: 'collaborator_signed',
                        actorName: signedByName || 'Guest',
                        actorEmail: 'guest@merzvia.com',
                        metadata: {
                            originalFileName: originalDoc.file_name,
                            signedFileName: originalDocData.file_name
                        }
                    });
                }
            }
        }

        // 5. Decrement document_limit by 1 (if > 0)
        const { error: updateError } = await supabase.rpc('decrement_document_limit', {
            user_clerk_id: clerkId
        })

        if (updateError) {
            const { data: currentLimitData } = await supabase
                .from("users")
                .select("document_limit")
                .eq("clerk_id", clerkId)
                .single()

            if (currentLimitData && currentLimitData.document_limit > 0) {
                await supabase
                    .from("users")
                    .update({ document_limit: currentLimitData.document_limit - 1 })
                    .eq("clerk_id", clerkId)
            }
        }

        return { success: true, data: docData }
    } catch (err: any) {
        console.error("Upload action error:", err)
        return { success: false, error: err.message || "Something went wrong" }
    }
}

export async function generateShareCodeAction(documentId: string): Promise<UploadResponse> {
    const { userId: clerkId } = await auth()
    if (!clerkId) return { success: false, error: "Unauthorized" }

    try {
        // Generate a random 8-character uppercase alphanumeric code
        const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase()

        const { data, error } = await supabase
            .from("documents")
            .update({
                share_code: shareCode,
                flow_type: 'collaborative'
            })
            .eq("id", documentId)
            .select()
            .single()

        if (error) throw error

        // --- Audit Log: Share Link Generated ---
        await recordDocumentAuditLog({
            documentId: documentId,
            eventType: 'share_code_generated',
            actorName: 'Owner',
            metadata: { shareCode }
        });

        return { success: true, data }
    } catch (error: any) {
        console.error("Error generating share code:", error)
        return { success: false, error: error.message }
    }
}

export async function getDocumentByShareCodeAction(shareCode: string): Promise<UploadResponse> {
    const { userId: clerkId } = await auth()
    if (!clerkId) return { success: false, error: "Unauthorized" }

    try {
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("share_code", shareCode.toUpperCase())
            .single()

        if (error || !data) {
            return { success: false, error: "Document not found. Please check the Reference Number." }
        }

        // --- Audit Log: Document Viewed via Share ---
        await recordDocumentAuditLog({
            documentId: data.id,
            eventType: 'viewed_via_share',
            actorName: 'Recipient',
            metadata: { shareCode: shareCode.toUpperCase() }
        });

        return { success: true, data }
    } catch (error: any) {
        console.error("Error fetching shared document:", error)
        return { success: false, error: error.message }
    }
}
