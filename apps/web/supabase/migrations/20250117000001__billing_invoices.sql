-- Add billing_invoices table for payment history tracking
-- BILLING-FIX-3: Webhook Invoice Handling & Email Notifications

CREATE TABLE IF NOT EXISTS public.billing_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    stripe_invoice_id text UNIQUE NOT NULL,
    stripe_customer_id text,
    amount_paid integer NOT NULL, -- Amount in cents
    amount_due integer NOT NULL,
    currency text NOT NULL DEFAULT 'usd',
    status text NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    hosted_invoice_url text,
    invoice_pdf text,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    paid_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_billing_invoices_org_id 
    ON public.billing_invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe_invoice_id 
    ON public.billing_invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status 
    ON public.billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_paid_at 
    ON public.billing_invoices(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_org_paid 
    ON public.billing_invoices(org_id, paid_at DESC);

-- RLS Policies
CREATE POLICY "Organization members can view invoices" 
    ON public.billing_invoices FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.org_id = billing_invoices.org_id 
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Server can manage invoices" 
    ON public.billing_invoices FOR ALL 
    USING (false);

-- Add comment
COMMENT ON TABLE public.billing_invoices IS 
    'Stores Stripe invoice history for payment tracking and receipts';
