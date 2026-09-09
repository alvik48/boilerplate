'use client';

import { ActivityIcon, ArrowRightIcon, CheckCircle2Icon, CircleAlertIcon, SaveIcon, SparklesIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@packages/ui/components/alert';
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@packages/ui/components/avatar';
import { Badge } from '@packages/ui/components/badge';
import { Button } from '@packages/ui/components/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@packages/ui/components/card';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@packages/ui/components/field';
import { Input } from '@packages/ui/components/input';
import { Progress } from '@packages/ui/components/progress';
import { Separator } from '@packages/ui/components/separator';
import { Skeleton } from '@packages/ui/components/skeleton';
import { Switch } from '@packages/ui/components/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@packages/ui/components/tabs';
import { ToggleGroup, ToggleGroupItem } from '@packages/ui/components/toggle-group';
import { cn } from '@packages/ui/lib/utils';

const themes = [
  { value: 'yellow', label: 'Yellow', className: 'theme-yellow' },
  { value: 'zinc', label: 'Zinc', className: 'theme-zinc' },
] as const;

type ThemeName = (typeof themes)[number]['value'];

const tokenSwatches = [
  { label: 'Background', className: 'bg-background text-foreground' },
  { label: 'Card', className: 'bg-card text-card-foreground' },
  { label: 'Primary', className: 'bg-primary text-primary-foreground' },
  { label: 'Secondary', className: 'bg-secondary text-secondary-foreground' },
  { label: 'Muted', className: 'bg-muted text-muted-foreground' },
  { label: 'Accent', className: 'bg-accent text-accent-foreground' },
  { label: 'Destructive', className: 'bg-destructive text-destructive-foreground' },
  { label: 'Sidebar', className: 'bg-sidebar text-sidebar-foreground' },
] as const;

const chartSwatches = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'] as const;

export const ThemeShowcase = () => {
  const [theme, setTheme] = useState<ThemeName>('yellow');
  const selectedTheme = useMemo(() => themes.find((item) => item.value === theme) ?? themes[0], [theme]);

  return (
    <main className={cn('min-h-screen bg-background text-foreground', selectedTheme.className)}>
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary">packages/ui theme</Badge>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">UI Theme Showcase</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Shared shadcn preset tokens rendered through components imported from @packages/ui.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              aria-label="Theme"
              type="single"
              value={theme}
              variant="outline"
              size="sm"
              spacing={1}
              onValueChange={(value) => {
                if (value) {
                  setTheme(value as ThemeName);
                }
              }}
            >
              {themes.map((item) => (
                <ToggleGroupItem aria-label={`${item.label} theme`} key={item.value} value={item.value}>
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button variant="outline">
              <ActivityIcon data-icon="inline-start" />
              Inspect
            </Button>
            <Button>
              <SaveIcon data-icon="inline-start" />
              Save preset
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tokenSwatches.map((swatch) => (
            <div className="rounded-lg border bg-card p-3" key={swatch.label}>
              <div
                aria-label={swatch.label}
                className={`${swatch.className} flex h-20 items-end rounded-md border p-3 text-xs font-medium`}
              >
                {swatch.label}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Button, badge, avatar, progress, and status states.</CardDescription>
              <CardAction>
                <Badge>
                  <SparklesIcon data-icon="inline-start" />
                  {selectedTheme.label}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">
                  Continue
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="ghost">Ghost</Badge>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                <AvatarGroup>
                  <Avatar>
                    <AvatarFallback>TH</AvatarFallback>
                    <AvatarBadge />
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>UI</AvatarFallback>
                  </Avatar>
                  <AvatarGroupCount>+2</AvatarGroupCount>
                </AvatarGroup>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">Theme coverage</span>
                    <span className="text-muted-foreground">82%</span>
                  </div>
                  <Progress value={82} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <span className="text-sm text-muted-foreground">Chart tokens</span>
              <div className="flex gap-1.5">
                {chartSwatches.map((className, index) => (
                  <span
                    aria-label={`Chart ${index + 1}`}
                    className={`${className} size-5 rounded-full border`}
                    key={className}
                  />
                ))}
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fields</CardTitle>
              <CardDescription>Form controls inherit radius, input, ring, and foreground tokens.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend>Execution profile</FieldLegend>
                <FieldDescription>Defaults for a generated frontend application.</FieldDescription>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
                    <Input id="workspace-name" defaultValue="Monorepo boilerplate" />
                    <FieldDescription>Used in page metadata and app chrome.</FieldDescription>
                  </Field>
                  <Field data-invalid>
                    <FieldLabel htmlFor="api-origin">API origin</FieldLabel>
                    <Input id="api-origin" aria-invalid defaultValue="http://localhost:4000" />
                    <FieldDescription>Invalid state uses destructive theme tokens.</FieldDescription>
                  </Field>
                  <Field orientation="horizontal">
                    <Switch defaultChecked id="live-preview" />
                    <FieldLabel htmlFor="live-preview">Live preview</FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Radix components preserve active, focus, and muted states.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                </TabsList>
                <TabsContent className="flex flex-col gap-4 rounded-lg border bg-background p-4" value="overview">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1 rounded-md bg-muted p-3">
                      <span className="text-sm text-muted-foreground">Sessions</span>
                      <strong className="text-2xl font-semibold">24</strong>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md bg-muted p-3">
                      <span className="text-sm text-muted-foreground">Orders</span>
                      <strong className="text-2xl font-semibold">318</strong>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md bg-muted p-3">
                      <span className="text-sm text-muted-foreground">Latency</span>
                      <strong className="text-2xl font-semibold">11ms</strong>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent className="flex flex-col gap-3 rounded-lg border bg-background p-4" value="orders">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                </TabsContent>
                <TabsContent className="rounded-lg border bg-background p-4" value="risk">
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Risk limit reached</AlertTitle>
                    <AlertDescription>Reduce active exposure before enabling another strategy.</AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <section className="dark rounded-lg border bg-background p-4 text-foreground">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary">dark scope</Badge>
                  <h2 className="text-xl font-semibold tracking-normal">Dark tokens</h2>
                </div>
                <Button size="icon" variant="outline" aria-label="Dark token action">
                  <SparklesIcon data-icon="inline-start" />
                </Button>
              </div>
              <Alert>
                <CheckCircle2Icon />
                <AlertTitle>Theme variables inherited</AlertTitle>
                <AlertDescription>
                  The same component imports adapt when a parent applies the dark class.
                </AlertDescription>
                <AlertAction>
                  <Button variant="outline">View</Button>
                </AlertAction>
              </Alert>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border bg-card p-3">
                  <span className="text-sm text-muted-foreground">Primary</span>
                  <div className="mt-3 h-10 rounded-md bg-primary" />
                </div>
                <div className="rounded-md border bg-card p-3">
                  <span className="text-sm text-muted-foreground">Accent</span>
                  <div className="mt-3 h-10 rounded-md bg-accent" />
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
};
