interface WuiSnackbarConfig {
    duration?: number;
    horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
    verticalPositition?: 'top' | 'bottom';
    offset?: { x?: string; y?: string };
}