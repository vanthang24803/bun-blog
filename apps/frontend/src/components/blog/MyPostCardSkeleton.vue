<template>
  <div
    class="overflow-hidden rounded-xl border border-border/70 bg-card animate-pulse"
    aria-hidden="true"
  >
    <div class="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
      <div class="min-h-52 bg-gradient-to-br from-muted via-muted/70 to-muted/40" />

      <div class="flex min-w-0 flex-col justify-between p-6">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="h-3 w-28 rounded-full bg-muted" />
            <div class="h-1 w-1 rounded-full bg-muted/80" />
            <div class="h-3 w-20 rounded-full bg-muted" />
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 flex-1 space-y-3">
              <div class="h-7 w-4/5 rounded-full bg-muted" />
              <div class="space-y-2">
                <div class="h-4 w-full rounded-full bg-muted/90" />
                <div class="h-4 w-11/12 rounded-full bg-muted/75" />
                <div class="h-4 w-2/3 rounded-full bg-muted/60" />
              </div>
            </div>
            <div class="h-7 w-24 shrink-0 rounded-full bg-muted" />
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-2">
          <div class="h-9 w-20 rounded-full bg-muted" />
          <div class="h-9 w-20 rounded-full bg-muted" />
          <div class="h-9 w-20 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  </div>
</template>
