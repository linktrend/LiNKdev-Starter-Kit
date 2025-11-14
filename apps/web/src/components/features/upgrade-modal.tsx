'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  requiredPlan: string
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredPlan }: UpgradeModalProps) {
  const router = useRouter()

  const planFeatures = {
    pro: ['10,000 records', '10,000 API calls/month', '50 automations', '50GB storage', 'Priority support'],
    business: [
      'Unlimited records',
      '100,000 API calls/month',
      'Unlimited automations',
      '500GB storage',
      'Advanced analytics',
      'SSO',
      'Priority support',
    ],
  }

  const features = planFeatures[requiredPlan as keyof typeof planFeatures] || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
          </DialogTitle>
          <DialogDescription className="text-center">
            <strong>{featureName}</strong> requires a {requiredPlan} plan or higher.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-3 text-sm font-semibold">Included in this plan:</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => {
              router.push('/en/billing')
              onClose()
            }}
            className="w-full"
          >
            View Plans
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to trigger upgrade modal
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [featureName, setFeatureName] = useState('')
  const [requiredPlan, setRequiredPlan] = useState('pro')

  const showUpgrade = (feature: string, plan: string = 'pro') => {
    setFeatureName(feature)
    setRequiredPlan(plan)
    setIsOpen(true)
  }

  return {
    isOpen,
    featureName,
    requiredPlan,
    showUpgrade,
    closeUpgrade: () => setIsOpen(false),
  }
}
