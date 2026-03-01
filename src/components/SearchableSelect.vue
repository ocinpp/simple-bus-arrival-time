<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";

export interface SelectOption {
    value: string;
    label: string;
}

const props = defineProps<{
    options: SelectOption[];
    modelValue: string;
    placeholder?: string;
    loading?: boolean;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: string];
}>();

const searchText = ref("");
const isOpen = ref(false);
const highlightIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
    const found = props.options.find((o) => o.value === props.modelValue);
    return found?.label ?? "";
});

const filteredOptions = computed(() => {
    if (!searchText.value) return props.options;
    const query = searchText.value.toLowerCase();
    return props.options.filter((o) => o.label.toLowerCase().includes(query));
});

watch(
    () => props.modelValue,
    (val) => {
        if (!val) searchText.value = "";
    }
);

watch(isOpen, (val) => {
    if (val) {
        searchText.value = "";
        highlightIndex.value = -1;
    }
});

function open() {
    isOpen.value = true;
}

function selectOption(option: SelectOption) {
    emit("update:modelValue", option.value);
    searchText.value = "";
    isOpen.value = false;
}

function onBlur(e: FocusEvent) {
    if (
        containerRef.value &&
        e.relatedTarget instanceof Node &&
        containerRef.value.contains(e.relatedTarget)
    ) {
        return;
    }
    isOpen.value = false;
    searchText.value = "";
}

function scrollToHighlighted() {
    nextTick(() => {
        const el = listRef.value?.querySelector("[data-highlighted]");
        el?.scrollIntoView({ block: "nearest" });
    });
}

function onKeydown(e: KeyboardEvent) {
    if (!isOpen.value && (e.key === "ArrowDown" || e.key === "Enter")) {
        open();
        e.preventDefault();
        return;
    }
    if (!isOpen.value) return;

    switch (e.key) {
        case "ArrowDown":
            e.preventDefault();
            highlightIndex.value = Math.min(
                highlightIndex.value + 1,
                filteredOptions.value.length - 1
            );
            scrollToHighlighted();
            break;
        case "ArrowUp":
            e.preventDefault();
            highlightIndex.value = Math.max(highlightIndex.value - 1, 0);
            scrollToHighlighted();
            break;
        case "Enter":
            e.preventDefault();
            if (
                highlightIndex.value >= 0 &&
                highlightIndex.value < filteredOptions.value.length
            ) {
                selectOption(filteredOptions.value[highlightIndex.value]);
            }
            break;
        case "Escape":
            isOpen.value = false;
            searchText.value = "";
            break;
    }
}
</script>

<template>
    <div
        ref="containerRef"
        class="searchable-select relative"
        @focusout="onBlur"
    >
        <div class="relative">
            <input
                type="text"
                class="dropdown w-full pr-8"
                :placeholder="placeholder ?? 'Search...'"
                :value="isOpen ? searchText : selectedLabel"
                @input="searchText = ($event.target as HTMLInputElement).value"
                @focus="open"
                @keydown="onKeydown"
            />
            <!-- Loading spinner -->
            <svg
                v-if="loading"
                class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none animate-spin"
                style="color: var(--color-primary)"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                />
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>
            <!-- Chevron -->
            <svg
                v-else
                class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60 transition-transform"
                :class="{ 'rotate-180': isOpen }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </div>
        <div
            v-if="isOpen"
            ref="listRef"
            class="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded border border-[var(--color-primary)] bg-[var(--color-bg)]"
        >
            <div
                v-if="filteredOptions.length === 0"
                class="px-3 py-2 text-sm opacity-50"
            >
                No results found
            </div>
            <div
                v-for="(option, idx) in filteredOptions"
                :key="option.value"
                :data-highlighted="idx === highlightIndex ? '' : undefined"
                class="px-3 py-2 text-sm cursor-pointer transition-colors"
                :class="{
                    'bg-[var(--color-accent)]': idx === highlightIndex,
                    'bg-[var(--color-accent)] opacity-80':
                        option.value === modelValue && idx !== highlightIndex,
                }"
                @pointerdown.prevent="selectOption(option)"
            >
                {{ option.label }}
            </div>
        </div>
    </div>
</template>
