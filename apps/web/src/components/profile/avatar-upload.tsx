'use client'

import { ChangeEvent, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, Loader2, User } from 'lucide-react'

import { updateAvatarUrl } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { uploadImage } from '@/utils/supabase/storage/client'
import { convertBlobUrlToFile } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

interface AvatarUploadProps {
  user: UserRow
  locale?: string
}

export function AvatarUpload({ user, locale }: AvatarUploadProps) {
  const { toast } = useToast()
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar_url ? `${user.avatar_url}?t=${Date.now()}` : null
  )
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const newImageUrl = URL.createObjectURL(file)
      setPreviewUrl(newImageUrl)
    }
  }

  const handleUpload = async () => {
    if (!user.id) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to upload an avatar',
        variant: 'destructive',
      })
      return
    }

    if (!previewUrl) {
      toast({
        title: 'No image selected',
        description: 'Please select an image to upload',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      try {
        // Convert blob URL to file
        const imageFile = await convertBlobUrlToFile(previewUrl, 'avatar.jpg')

        // Upload to Supabase Storage
        const { imageUrl: uploadedImageUrl, error } = await uploadImage(
          'avatars',
          `${user.id}/avatar.jpg`,
          imageFile
        )

        if (error) {
          toast({
            title: 'Upload failed',
            description: error,
            variant: 'destructive',
          })
          return
        }

        if (uploadedImageUrl) {
          // Update avatar URL in database
          const result = await updateAvatarUrl(uploadedImageUrl, locale)

          if (result.error) {
            toast({
              title: 'Failed to save avatar',
              description: result.error,
              variant: 'destructive',
            })
            return
          }

          // Update UI
          setAvatarUrl(`${uploadedImageUrl}?t=${Date.now()}`)
          setPreviewUrl('')

          toast({
            title: 'Avatar updated',
            description: 'Your profile picture has been updated successfully',
          })

          // Clear file input
          if (imageInputRef.current) {
            imageInputRef.current.value = ''
          }
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: 'destructive',
        })
      }
    })
  }

  const handleCancel = () => {
    setPreviewUrl('')
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const displayUrl = previewUrl || avatarUrl

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-border">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Avatar"
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="hidden"
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => imageInputRef.current?.click()}
              asChild
            >
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Choose image
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP or GIF (max 5MB)
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload avatar'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

