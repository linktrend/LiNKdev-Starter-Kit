import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Database } from '@/types/database.types'
import type {
  EducationEntry,
  WorkExperienceEntry,
} from '@/lib/validation/profile'
import { Briefcase, Building2, Mail, MapPin, Phone } from 'lucide-react'

const personalTitles = ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.']

type UserRow = Database['public']['Tables']['users']['Row']

function getInitials(user: UserRow) {
  const first = user.first_name?.charAt(0)
  const last = user.last_name?.charAt(0)
  return (first || '') + (last || '') || 'U'
}

function parseEducation(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return []
  return value as EducationEntry[]
}

function parseWorkExperience(value: unknown): WorkExperienceEntry[] {
  if (!Array.isArray(value)) return []
  return value as WorkExperienceEntry[]
}

interface ProfileViewCardProps {
  user: UserRow
}

export default function ProfileViewCard({ user }: ProfileViewCardProps) {
  const educationEntries = parseEducation(user.education)
  const workEntries = parseWorkExperience(user.work_experience)

  const fullName =
    user.full_name ||
    [user.first_name, user.middle_name, user.last_name]
      .filter(Boolean)
      .join(' ')

  const addressLines = [
    [user.personal_apt_suite, user.personal_street_address_1, user.personal_street_address_2]
      .filter(Boolean)
      .join(', '),
    [user.personal_city, user.personal_state, user.personal_postal_code]
      .filter(Boolean)
      .join(', '),
    user.personal_country,
  ].filter((line) => line && line.length > 0) as string[]

  const businessAddressLines = [
    [user.business_apt_suite, user.business_street_address_1, user.business_street_address_2]
      .filter(Boolean)
      .join(', '),
    [user.business_city, user.business_state, user.business_postal_code]
      .filter(Boolean)
      .join(', '),
    user.business_country,
  ].filter((line) => line && line.length > 0) as string[]

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url ?? undefined} alt={fullName} />
              <AvatarFallback>{getInitials(user)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {user.username ? `@${user.username}` : 'Username pending'}
              </p>
              <h2 className="text-2xl font-semibold">{fullName || 'Unnamed user'}</h2>
              <p className="text-muted-foreground">
                {[user.display_name, user.personal_title]
                  .filter((value) => value && !personalTitles.includes(value))
                  .join(' • ')}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{user.email ?? 'No email on file'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>
                {user.phone_number
                  ? `${user.phone_country_code ?? ''} ${user.phone_number}`.trim()
                  : 'No phone on file'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>
                {[user.business_position, user.business_company]
                  .filter(Boolean)
                  .join(' at ') || 'Role not set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {user.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{user.bio}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Email</p>
              <p>{user.email ?? 'No email on file'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Phone</p>
              <p>
                {user.phone_number
                  ? `${user.phone_country_code ?? ''} ${user.phone_number}`.trim()
                  : 'No phone on file'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Personal address</p>
              {addressLines.length > 0 ? (
                <div className="space-y-1">
                  {addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : (
                <p>No personal address provided</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{user.business_company || 'Company not set'}</span>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Business address</p>
              {businessAddressLines.length > 0 ? (
                <div className="space-y-1">
                  {businessAddressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : (
                <p>No business address provided</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {(educationEntries.length > 0 || workEntries.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {educationEntries.length > 0 && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Education</p>
                <div className="mt-3 space-y-3">
                  {educationEntries.map((entry) => (
                    <div key={entry.id ?? `${entry.institution}-${entry.start_year}`} className="rounded-md border p-3">
                      <p className="font-medium">{entry.institution}</p>
                      <p className="text-sm text-muted-foreground">
                        {[entry.degree, entry.field].filter(Boolean).join(' • ') || 'Degree not specified'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[entry.start_year, entry.end_year].filter(Boolean).join(' – ') || 'Dates not provided'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {educationEntries.length > 0 && workEntries.length > 0 && <Separator />}

            {workEntries.length > 0 && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Work experience</p>
                <div className="mt-3 space-y-3">
                  {workEntries.map((entry) => (
                    <div key={entry.id ?? `${entry.company}-${entry.position}`} className="rounded-md border p-3">
                      <p className="font-medium">{entry.position}</p>
                      <p className="text-sm text-muted-foreground">{entry.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {[entry.start_date, entry.end_date].filter(Boolean).join(' – ') || (entry.current ? 'Current role' : 'Dates not provided')}
                      </p>
                      {entry.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
