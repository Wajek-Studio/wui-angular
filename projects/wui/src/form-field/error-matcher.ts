import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";

export interface WuiErrorMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
}

export class WuiDefaultErrorMatcher implements WuiErrorMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
    
}