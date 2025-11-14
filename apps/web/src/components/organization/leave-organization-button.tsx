'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { leaveOrganization } from '@/app/actions/organization'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

interface LeaveOrganizationButtonProps {
  orgId: string
  locale: string
}

export function LeaveOrganizationButton({ orgId, locale }: LeaveOrganizationButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleLeave = () => {
    startTransition(async () => {
      const result = await leaveOrganization(orgId, locale)
      if (result?.error) {
        toast({
          title: 'Unable to leave organization',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Left organization',
        description: 'You no longer have access to this workspace.',
      })
      router.push(`/${locale}/dashboard`)
      router.refresh()
    })
  }

  return (
    <Button variant="destructive" onClick={handleLeave} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Leaving...
        </>
      ) : (
        'Leave organization'
      )}
    </Button>
  )
}
