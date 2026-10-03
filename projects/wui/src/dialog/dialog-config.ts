export interface WuiDialogConfig {
    width?: string;
    maxWidth?: string;
    height?: string;
    maxHeight?: string;
    dismissable?: boolean;
}

export interface WuiAlertDialogConfig {
    title: string;
    message: string;
}

export interface WuiConfirmDialogAction {
    label: string;
    variant: "text" | "filled" | "outlined",
    color: "default" | "primary" | "danger"
}

export interface WuiConfirmDialogConfig {
    title?: string;
    message?: string;
    actions?: WuiConfirmDialogAction[]
}

export interface WuiConfirmDialogParam {
    title: string;
    message: string;
    actions: Array<WuiConfirmDialogAction | string>;
}