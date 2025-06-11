// src/app/api/users/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {  supabaseAdmin } from '@/server/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Get file extension
    const fileExtension = file.name.split('.').pop()
    
    // Generate unique filename
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    console.log('Uploading file to Supabase:', fileName)

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('profile-images')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload to storage', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get the public URL using admin client
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('profile-images')
      .getPublicUrl(fileName)

    console.log('File uploaded successfully. Public URL:', publicUrl)

    return NextResponse.json({ 
      url: publicUrl,
      path: uploadData.path 
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    )
  }
}