"use server"

import { v2 as cloudinary } from "cloudinary"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

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

    try {
        // 1. Get the local Supabase user ID
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
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

        // 4. Insert into Supabase documents table
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
            })
            .select()
            .single()

        if (docError) {
            console.error("Database insertion error:", docError)
            return { success: false, error: "Failed to save document record" }
        }

        // 5. Decrement document_limit by 1 (if > 0)
        // Note: For Pro/Elite plans, we might have a very high limit or handled differently,
        // but as per request, we decrement the count.
        const { error: updateError } = await supabase.rpc('decrement_document_limit', {
            user_clerk_id: clerkId
        })

        // Fallback if RPC doesn't exist: manually update
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
