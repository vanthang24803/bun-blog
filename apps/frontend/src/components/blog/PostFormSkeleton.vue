<template>
  <div class="space-y-6 animate-pulse">
    <div class="grid gap-5 md:grid-cols-2">
      <div class="space-y-2">
        <div class="h-4 w-20 rounded bg-muted" />
        <div class="h-10 rounded-md bg-muted/80" />
      </div>
      <div class="space-y-2">
        <div class="h-4 w-20 rounded bg-muted" />
        <div class="h-10 rounded-md bg-muted/80" />
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-3">
      <div class="space-y-2">
        <div class="h-4 w-16 rounded bg-muted" />
        <div class="h-10 rounded-md bg-muted/80" />
      </div>
      <div class="space-y-2">
        <div class="h-4 w-20 rounded bg-muted" />
        <div class="h-10 rounded-md bg-muted/80" />
      </div>
      <div class="space-y-2 md:col-span-3">
        <div class="h-4 w-24 rounded bg-muted" />
        <div class="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
          <div class="space-y-3 text-center">
            <div class="mx-auto h-12 w-12 rounded-full bg-muted" />
            <div class="h-3 w-40 rounded bg-muted mx-auto" />
            <div class="h-3 w-56 rounded bg-muted/80 mx-auto" />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="h-4 w-20 rounded bg-muted" />
      <div class="h-20 rounded-md bg-muted/80" />
    </div>

    <div class="space-y-2">
      <div class="h-4 w-12 rounded bg-muted" />
      <div class="flex flex-wrap gap-2">
        <div
          v-for="pill in 6"
          :key="pill"
          class="h-8 rounded-full bg-muted/80"
          :class="pill % 2 === 0 ? 'w-20' : 'w-24'"
        />
      </div>
    </div>

    <div class="space-y-2">
      <div class="h-4 w-20 rounded bg-muted" />
      <div class="h-72 rounded-xl border border-border bg-muted/40" />
    </div>

    <div class="flex justify-end pt-2">
      <div class="h-10 w-32 rounded-md bg-muted/80" />
    </div>
  </div>
</template>
