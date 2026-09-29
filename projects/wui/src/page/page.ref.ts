export class WuiPageRef {
  constructor(private readonly closeFn: () => void) {}

  close(): void {
    this.closeFn();
  }
}
