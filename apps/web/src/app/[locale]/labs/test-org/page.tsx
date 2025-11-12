export default function TestOrgPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Org Sandbox</h1>
      <p className="text-muted-foreground">
        Use this area to prototype multi-tenant flows before rolling them into the main application. Hook your experiments
        into Supabase org mocks or paste JSON fixtures directly into the component tree.
      </p>
    </div>
  );
}
