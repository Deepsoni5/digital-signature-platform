'use client';

import { useState, useCallback, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type {
    ESignState,
    SignatureElement,
    UploadedDocument,
    Position,
    Size
} from '../components/esign/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useESign() {
    const [state, setState] = useState<ESignState>({
        document: null,
        elements: [],
        currentPage: 1,
        zoom: 1,
        selectedElement: null,
        isDrawing: false,
        mode: 'select',
        signatureImage: null,
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const loadDocument = useCallback(async (file: File): Promise<void> => {
        const arrayBuffer = await file.arrayBuffer();
        const isPdf = file.type === 'application/pdf';

        let numPages = 1;

        if (isPdf) {
            try {
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                numPages = pdfDoc.getPageCount();
            } catch (error) {
                console.error('Error loading PDF:', error);
                throw new Error('Failed to load PDF document');
            }
        }

        const document: UploadedDocument = {
            id: generateId(),
            name: file.name,
            type: isPdf ? 'pdf' : 'image',
            data: arrayBuffer,
            numPages,
        };

        setState(prev => ({
            ...prev,
            document,
            elements: [],
            currentPage: 1,
            selectedElement: null,
        }));
    }, []);

    const addElement = useCallback((
        type: SignatureElement['type'],
        content: string,
        position?: Position,
        size?: Size,
        options?: Partial<SignatureElement>
    ): string => {
        const id = generateId();

        const newElement: SignatureElement = {
            id,
            type,
            position: position || { x: 100, y: 100 },
            size: size || {
                width: type === 'signature' ? 200 : type === 'checkbox' ? 24 : 150,
                height: type === 'signature' ? 80 : type === 'checkbox' ? 24 : 40
            },
            page: state.currentPage,
            content,
            rotation: 0,
            fontFamily: options?.fontFamily || '"Dancing Script", cursive',
            fontSize: options?.fontSize || 24,
            color: options?.color || '#000000',
            createdAt: new Date(),
            ...options,
        };

        setState(prev => ({
            ...prev,
            elements: [...prev.elements, newElement],
            selectedElement: id,
            mode: 'select',
        }));

        return id;
    }, [state.currentPage]);

    const updateElement = useCallback((id: string, updates: Partial<SignatureElement>) => {
        setState(prev => ({
            ...prev,
            elements: prev.elements.map(el =>
                el.id === id ? { ...el, ...updates } : el
            ),
        }));
    }, []);

    const removeElement = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            elements: prev.elements.filter(el => el.id !== id),
            selectedElement: prev.selectedElement === id ? null : prev.selectedElement,
        }));
    }, []);

    const selectElement = useCallback((id: string | null) => {
        setState(prev => ({
            ...prev,
            selectedElement: id,
        }));
    }, []);

    const setCurrentPage = useCallback((page: number) => {
        if (state.document && page >= 1 && page <= state.document.numPages) {
            setState(prev => ({
                ...prev,
                currentPage: page,
                selectedElement: null,
            }));
        }
    }, [state.document]);

    const setZoom = useCallback((zoom: number) => {
        setState(prev => ({
            ...prev,
            zoom: Math.max(0.25, Math.min(3, zoom)),
        }));
    }, []);

    const setMode = useCallback((mode: ESignState['mode']) => {
        setState(prev => ({
            ...prev,
            mode,
            selectedElement: null,
        }));
    }, []);

    const setSignatureImage = useCallback((image: string | null) => {
        setState(prev => ({
            ...prev,
            signatureImage: image,
        }));
    }, []);

    const generateSignedDocument = useCallback(async (): Promise<Blob> => {
        if (!state.document) {
            throw new Error('No document loaded');
        }

        if (state.document.type === 'pdf') {
            const pdfDoc = await PDFDocument.load(state.document.data);
            const pages = pdfDoc.getPages();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            for (const element of state.elements) {
                const page = pages[element.page - 1];
                if (!page) continue;

                const { width: pageWidth, height: pageHeight } = page.getSize();

                // Canvas and PDF both use scale 1 - positions already match
                // Convert coordinates from top-left origin to PDF bottom-left origin
                const x = element.position.x;
                const y = pageHeight - element.position.y - element.size.height;

                if (element.type === 'signature' || element.type === 'initials') {
                    // Embed signature image
                    if (element.content.startsWith('data:image/png')) {
                        const base64Data = element.content.split(',')[1];
                        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                        const image = await pdfDoc.embedPng(imageBytes);

                        page.drawImage(image, {
                            x,
                            y,
                            width: element.size.width,
                            height: element.size.height,
                            rotate: degrees(element.rotation || 0),
                        });
                    }
                } else if (element.type === 'text' || element.type === 'date') {
                    // Draw text
                    const color = element.color || '#000000';
                    const r = parseInt(color.slice(1, 3), 16) / 255;
                    const g = parseInt(color.slice(3, 5), 16) / 255;
                    const b = parseInt(color.slice(5, 7), 16) / 255;

                    page.drawText(element.content, {
                        x,
                        y: y + element.size.height - (element.fontSize || 24),
                        size: element.fontSize || 24,
                        font: helveticaFont,
                        color: rgb(r, g, b),
                        rotate: degrees(element.rotation || 0),
                    });
                } else if (element.type === 'checkbox') {
                    // Draw checkbox
                    page.drawRectangle({
                        x,
                        y,
                        width: element.size.width,
                        height: element.size.height,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });

                    if (element.content === 'checked') {
                        page.drawText('✓', {
                            x: x + 4,
                            y: y + 4,
                            size: element.size.width - 8,
                            font: helveticaFont,
                            color: rgb(0, 0, 0),
                        });
                    }
                }
            }

            const pdfBytes = await pdfDoc.save();
            return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        } else {
            // For images, use canvas to composite
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                const img = new Image();
                const blob = new Blob([state.document!.data]);
                const url = URL.createObjectURL(blob);

                img.onload = async () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Draw elements
                    for (const element of state.elements) {
                        if (element.page !== 1) continue; // Images only have 1 page

                        if (element.type === 'signature' || element.type === 'initials') {
                            if (element.content.startsWith('data:image')) {
                                const sigImg = new Image();
                                await new Promise<void>((res) => {
                                    sigImg.onload = () => {
                                        ctx.save();
                                        ctx.translate(element.position.x, element.position.y);
                                        ctx.rotate((element.rotation * Math.PI) / 180);
                                        ctx.drawImage(
                                            sigImg,
                                            0,
                                            0,
                                            element.size.width,
                                            element.size.height
                                        );
                                        ctx.restore();
                                        res();
                                    };
                                    sigImg.src = element.content;
                                });
                            }
                        } else if (element.type === 'text' || element.type === 'date') {
                            ctx.save();
                            ctx.translate(element.position.x, element.position.y);
                            ctx.rotate((element.rotation * Math.PI) / 180);
                            ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
                            ctx.fillStyle = element.color || '#000000';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(element.content, 0, 0);
                            ctx.restore();
                        }
                    }

                    URL.revokeObjectURL(url);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to generate image'));
                        }
                    }, 'image/png');
                };

                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to load image'));
                };

                img.src = url;
            });
        }
    }, [state.document, state.elements]);

    const clearAll = useCallback(() => {
        setState(prev => ({
            ...prev,
            elements: [],
            selectedElement: null,
        }));
    }, []);

    const reset = useCallback(() => {
        setState({
            document: null,
            elements: [],
            currentPage: 1,
            zoom: 1,
            selectedElement: null,
            isDrawing: false,
            mode: 'select',
            signatureImage: null,
        });
    }, []);

    return {
        state,
        canvasRef,
        loadDocument,
        addElement,
        updateElement,
        removeElement,
        selectElement,
        setCurrentPage,
        setZoom,
        setMode,
        setSignatureImage,
        generateSignedDocument,
        clearAll,
        reset,
    };
}
