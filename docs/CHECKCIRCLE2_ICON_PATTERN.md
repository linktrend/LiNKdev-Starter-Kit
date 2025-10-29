# CheckCircle2 Icon Usage Pattern

## Standard Pattern

The `CheckCircle2` icon from `lucide-react` is used consistently across the application to indicate success, completion, or positive status.

## Standard Sizes

Use one of these standard sizes:
- `h-4 w-4` - For inline icons, buttons, and table cells
- `h-5 w-5` - For card headers and larger status indicators

## Standard Colors

Use one of these standard colors:
- `text-green-500` - Standard success color (most common)
- `text-green-600` - Slightly darker green for emphasis

### Examples

```tsx
// Standard inline status icon
<CheckCircle2 className="h-4 w-4 text-green-500" />

// Card header with status
<CheckCircle2 className="h-5 w-5 text-green-600" />

// Table cell status
{status === 'completed' ? (
  <CheckCircle2 className="h-4 w-4 text-green-500" />
) : (
  <XCircle className="h-4 w-4 text-red-500" />
)}
```

## Usage Locations

This pattern is consistently used in:
- **Database page**: Table RLS status indicators
- **Jobs/Queue page**: Job status indicators
- **Health Checks page**: Service health status
- **Config page**: Build and environment status
- **Reports page**: Report completion status

## Notes

- Always pair with appropriate sizing and color classes
- For negative states, use `XCircle` with `text-red-500` or `text-red-600`
- Icons without explicit colors may inherit from parent context (use sparingly)

