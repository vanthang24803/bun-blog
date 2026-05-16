<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from "vue";
import { Button } from "@/components/ui/button";

const CANVAS_SIZE = 320;
const CROP_RADIUS = 128;
const OUTPUT_SIZE = 400;

const props = defineProps<{ open: boolean; file: File | null }>();
const emit = defineEmits<{
  cancel: [];
  cropped: [blob: Blob];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(false);

let img: HTMLImageElement | null = null;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let minScale = 1;

// Drag state
let isDragging = false;
let lastX = 0;
let lastY = 0;

// ── Load image ──────────────────────────────────────────────────────────────
watch(
  () => props.file,
  async (file) => {
    if (!file) return;
    isLoading.value = true;
    img = await loadImage(file);
    // Fit: initial scale so image covers the crop circle
    const fit = (CROP_RADIUS * 2) / Math.min(img.naturalWidth, img.naturalHeight);
    minScale = fit;
    scale = fit;
    offsetX = 0;
    offsetY = 0;
    isLoading.value = false;
    await nextTick();
    draw();
  },
);

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => { URL.revokeObjectURL(url); resolve(el); };
    el.onerror = reject;
    el.src = url;
  });
}

// ── Drawing ──────────────────────────────────────────────────────────────────
function draw() {
  const canvas = canvasRef.value;
  if (!canvas || !img) return;
  const ctx = canvas.getContext("2d")!;
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Image
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = cx + offsetX - dw / 2;
  const dy = cy + offsetY - dh / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  // Dark overlay with circular cutout
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2, true); // cutout (clockwise=false)
  ctx.fill("evenodd");
  ctx.restore();

  // Crop circle border
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ── Clamp so crop circle always stays inside the image ───────────────────────
function clampOffset() {
  if (!img) return;
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;

  // Left edge of image must be ≤ cropLeft, right edge ≥ cropRight
  const cropLeft  = cx - CROP_RADIUS;
  const cropRight = cx + CROP_RADIUS;
  const cropTop   = cy - CROP_RADIUS;
  const cropBot   = cy + CROP_RADIUS;

  // Image left: cx + offsetX - dw/2  ≤  cropLeft  →  offsetX ≤ cropLeft - cx + dw/2
  const maxOX = cropLeft - cx + dw / 2;
  const minOX = cropRight - cx - dw / 2;
  const maxOY = cropTop - cy + dh / 2;
  const minOY = cropBot - cy - dh / 2;

  offsetX = Math.min(maxOX, Math.max(minOX, offsetX));
  offsetY = Math.min(maxOY, Math.max(minOY, offsetY));
}

// ── Mouse events ──────────────────────────────────────────────────────────────
function onMouseDown(e: MouseEvent) {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return;
  offsetX += e.clientX - lastX;
  offsetY += e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  clampOffset();
  draw();
}

function onMouseUp() { isDragging = false; }

function onWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  scale = Math.min(8, Math.max(minScale, scale + delta));
  clampOffset();
  draw();
}

// Touch support
let lastTouchDist = 0;
function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    isDragging = false;
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
  }
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault();
  if (e.touches.length === 1 && isDragging) {
    offsetX += e.touches[0].clientX - lastX;
    offsetY += e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    clampOffset();
    draw();
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    scale = Math.min(8, Math.max(minScale, scale * (dist / lastTouchDist)));
    lastTouchDist = dist;
    clampOffset();
    draw();
  }
}

function onTouchEnd() { isDragging = false; }

onUnmounted(() => { isDragging = false; });

// ── Export ────────────────────────────────────────────────────────────────────
function cropAndEmit() {
  if (!img) return;
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;

  // Image draw origin on the preview canvas
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = cx + offsetX - dw / 2;
  const dy = cy + offsetY - dh / 2;

  // Crop circle center in image-source pixels
  const srcX = ((cx - dx) / scale) - (CROP_RADIUS / scale);
  const srcY = ((cy - dy) / scale) - (CROP_RADIUS / scale);
  const srcSize = (CROP_RADIUS * 2) / scale;

  const out = document.createElement("canvas");
  out.width = OUTPUT_SIZE;
  out.height = OUTPUT_SIZE;
  const ctx = out.getContext("2d")!;

  // Circular clip
  ctx.beginPath();
  ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  out.toBlob((blob) => {
    if (blob) emit("cropped", blob);
  }, "image/webp", 0.92);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @keydown.esc="emit('cancel')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('cancel')" />

      <!-- Panel -->
      <div
        class="relative z-10 w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Crop avatar"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 class="text-sm font-semibold">Crop avatar</h2>
            <p class="text-xs text-muted-foreground mt-0.5">Drag to reposition · scroll to zoom</p>
          </div>
          <button
            class="text-muted-foreground hover:text-foreground transition-colors"
            @click="emit('cancel')"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Canvas -->
        <div class="bg-neutral-900 flex items-center justify-center select-none">
          <div v-if="isLoading" class="flex items-center justify-center h-[320px] w-[320px]">
            <svg class="animate-spin h-6 w-6 text-white/50" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
          <canvas
            v-else
            ref="canvasRef"
            :width="CANVAS_SIZE"
            :height="CANVAS_SIZE"
            class="cursor-grab active:cursor-grabbing touch-none"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @wheel.prevent="onWheel"
            @touchstart.prevent="onTouchStart"
            @touchmove.prevent="onTouchMove"
            @touchend="onTouchEnd"
          />
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="ghost" size="sm" @click="emit('cancel')">Cancel</Button>
          <Button size="sm" @click="cropAndEmit">
            <svg class="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Apply & upload
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
