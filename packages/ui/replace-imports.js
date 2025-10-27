import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(findFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.includes(extname(item))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to replace imports in a file
function replaceImports(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace @starter/ui imports with direct imports
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@starter\/ui['"];?/g;
  
  content = content.replace(importRegex, (match, imports) => {
    modified = true;
    const importList = imports.split(',').map(imp => imp.trim());
    
    // Map common imports to their direct paths
    const importMap = {
      'Button': '@/components/ui/button',
      'Card': '@/components/ui/card',
      'Input': '@/components/ui/input',
      'Label': '@/components/ui/label',
      'Sheet': '@/components/ui/sheet',
      'SheetContent': '@/components/ui/sheet',
      'SheetTrigger': '@/components/ui/sheet',
      'useToast': '@/components/ui/use-toast',
      'Toast': '@/components/ui/toast',
      'Toaster': '@/components/ui/toast',
      'Dialog': '@/components/ui/dialog',
      'DialogContent': '@/components/ui/dialog',
      'DialogTrigger': '@/components/ui/dialog',
      'DialogHeader': '@/components/ui/dialog',
      'DialogTitle': '@/components/ui/dialog',
      'DialogDescription': '@/components/ui/dialog',
      'DialogFooter': '@/components/ui/dialog',
      'DropdownMenu': '@/components/ui/dropdown-menu',
      'DropdownMenuContent': '@/components/ui/dropdown-menu',
      'DropdownMenuItem': '@/components/ui/dropdown-menu',
      'DropdownMenuTrigger': '@/components/ui/dropdown-menu',
      'DropdownMenuSeparator': '@/components/ui/dropdown-menu',
      'DropdownMenuLabel': '@/components/ui/dropdown-menu',
      'DropdownMenuGroup': '@/components/ui/dropdown-menu',
      'DropdownMenuCheckboxItem': '@/components/ui/dropdown-menu',
      'DropdownMenuRadioGroup': '@/components/ui/dropdown-menu',
      'DropdownMenuRadioItem': '@/components/ui/dropdown-menu',
      'DropdownMenuSub': '@/components/ui/dropdown-menu',
      'DropdownMenuSubContent': '@/components/ui/dropdown-menu',
      'DropdownMenuSubTrigger': '@/components/ui/dropdown-menu',
      'DropdownMenuPortal': '@/components/ui/dropdown-menu',
      'DropdownMenuShortcut': '@/components/ui/dropdown-menu',
      'Accordion': '@/components/ui/accordion',
      'AccordionContent': '@/components/ui/accordion',
      'AccordionItem': '@/components/ui/accordion',
      'AccordionTrigger': '@/components/ui/accordion',
      'Alert': '@/components/ui/alert',
      'AlertDescription': '@/components/ui/alert',
      'AlertTitle': '@/components/ui/alert',
      'AlertDialog': '@/components/ui/alert-dialog',
      'AlertDialogAction': '@/components/ui/alert-dialog',
      'AlertDialogCancel': '@/components/ui/alert-dialog',
      'AlertDialogContent': '@/components/ui/alert-dialog',
      'AlertDialogDescription': '@/components/ui/alert-dialog',
      'AlertDialogFooter': '@/components/ui/alert-dialog',
      'AlertDialogHeader': '@/components/ui/alert-dialog',
      'AlertDialogTitle': '@/components/ui/alert-dialog',
      'AlertDialogTrigger': '@/components/ui/alert-dialog',
      'Avatar': '@/components/ui/avatar',
      'AvatarFallback': '@/components/ui/avatar',
      'AvatarImage': '@/components/ui/avatar',
      'Badge': '@/components/ui/badge',
      'Breadcrumb': '@/components/ui/breadcrumb',
      'BreadcrumbItem': '@/components/ui/breadcrumb',
      'BreadcrumbLink': '@/components/ui/breadcrumb',
      'BreadcrumbList': '@/components/ui/breadcrumb',
      'BreadcrumbPage': '@/components/ui/breadcrumb',
      'BreadcrumbSeparator': '@/components/ui/breadcrumb',
      'Calendar': '@/components/ui/calendar',
      'Carousel': '@/components/ui/carousel',
      'CarouselContent': '@/components/ui/carousel',
      'CarouselItem': '@/components/ui/carousel',
      'CarouselNext': '@/components/ui/carousel',
      'CarouselPrevious': '@/components/ui/carousel',
      'Checkbox': '@/components/ui/checkbox',
      'Command': '@/components/ui/command',
      'CommandDialog': '@/components/ui/command',
      'CommandEmpty': '@/components/ui/command',
      'CommandGroup': '@/components/ui/command',
      'CommandInput': '@/components/ui/command',
      'CommandItem': '@/components/ui/command',
      'CommandList': '@/components/ui/command',
      'CommandSeparator': '@/components/ui/command',
      'CommandShortcut': '@/components/ui/command',
      'Form': '@/components/ui/form',
      'FormControl': '@/components/ui/form',
      'FormDescription': '@/components/ui/form',
      'FormField': '@/components/ui/form',
      'FormItem': '@/components/ui/form',
      'FormLabel': '@/components/ui/form',
      'FormMessage': '@/components/ui/form',
      'HoverCard': '@/components/ui/hover-card',
      'HoverCardContent': '@/components/ui/hover-card',
      'HoverCardTrigger': '@/components/ui/hover-card',
      'InputOTP': '@/components/ui/input-otp',
      'InputOTPGroup': '@/components/ui/input-otp',
      'InputOTPInput': '@/components/ui/input-otp',
      'InputOTPSeparator': '@/components/ui/input-otp',
      'Menubar': '@/components/ui/menubar',
      'MenubarContent': '@/components/ui/menubar',
      'MenubarItem': '@/components/ui/menubar',
      'MenubarMenu': '@/components/ui/menubar',
      'MenubarSeparator': '@/components/ui/menubar',
      'MenubarShortcut': '@/components/ui/menubar',
      'MenubarSub': '@/components/ui/menubar',
      'MenubarSubContent': '@/components/ui/menubar',
      'MenubarSubTrigger': '@/components/ui/menubar',
      'MenubarTrigger': '@/components/ui/menubar',
      'NavigationMenu': '@/components/ui/navigation-menu',
      'NavigationMenuContent': '@/components/ui/navigation-menu',
      'NavigationMenuIndicator': '@/components/ui/navigation-menu',
      'NavigationMenuItem': '@/components/ui/navigation-menu',
      'NavigationMenuLink': '@/components/ui/navigation-menu',
      'NavigationMenuList': '@/components/ui/navigation-menu',
      'NavigationMenuTrigger': '@/components/ui/navigation-menu',
      'NavigationMenuViewport': '@/components/ui/navigation-menu',
      'Popover': '@/components/ui/popover',
      'PopoverContent': '@/components/ui/popover',
      'PopoverTrigger': '@/components/ui/popover',
      'Progress': '@/components/ui/progress',
      'RadioGroup': '@/components/ui/radio-group',
      'RadioGroupItem': '@/components/ui/radio-group',
      'Resizable': '@/components/ui/resizable',
      'ResizableHandle': '@/components/ui/resizable',
      'ResizablePanel': '@/components/ui/resizable',
      'ResizablePanelGroup': '@/components/ui/resizable',
      'ScrollArea': '@/components/ui/scroll-area',
      'ScrollBar': '@/components/ui/scroll-area',
      'Select': '@/components/ui/select',
      'SelectContent': '@/components/ui/select',
      'SelectItem': '@/components/ui/select',
      'SelectTrigger': '@/components/ui/select',
      'SelectValue': '@/components/ui/select',
      'Separator': '@/components/ui/separator',
      'Skeleton': '@/components/ui/skeleton',
      'Slider': '@/components/ui/slider',
      'Switch': '@/components/ui/switch',
      'Table': '@/components/ui/table',
      'TableBody': '@/components/ui/table',
      'TableCell': '@/components/ui/table',
      'TableHead': '@/components/ui/table',
      'TableHeader': '@/components/ui/table',
      'TableRow': '@/components/ui/table',
      'Tabs': '@/components/ui/tabs',
      'TabsContent': '@/components/ui/tabs',
      'TabsList': '@/components/ui/tabs',
      'TabsTrigger': '@/components/ui/tabs',
      'Textarea': '@/components/ui/textarea',
      'Toggle': '@/components/ui/toggle',
      'ToggleGroup': '@/components/ui/toggle-group',
      'ToggleGroupItem': '@/components/ui/toggle-group',
      'Tooltip': '@/components/ui/tooltip',
      'TooltipContent': '@/components/ui/tooltip',
      'TooltipProvider': '@/components/ui/tooltip',
      'TooltipTrigger': '@/components/ui/tooltip',
    };
    
    // Group imports by their target path
    const groupedImports = {};
    for (const imp of importList) {
      const targetPath = importMap[imp] || '@/components/ui/' + imp.toLowerCase();
      if (!groupedImports[targetPath]) {
        groupedImports[targetPath] = [];
      }
      groupedImports[targetPath].push(imp);
    }
    
    // Generate new import statements
    const newImports = Object.entries(groupedImports)
      .map(([path, imports]) => `import { ${imports.join(', ')} } from '${path}';`)
      .join('\n');
    
    return newImports;
  });
  
  if (modified) {
    writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
  
  return modified;
}

// Main execution
const webAppPath = join(process.cwd(), '../../apps/web/src');
const files = findFiles(webAppPath);

console.log(`Found ${files.length} files to process...`);

let modifiedCount = 0;
for (const file of files) {
  if (replaceImports(file)) {
    modifiedCount++;
  }
}

console.log(`Modified ${modifiedCount} files`);
