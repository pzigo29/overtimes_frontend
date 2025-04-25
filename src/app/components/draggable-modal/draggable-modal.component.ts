import { Component, ElementRef, Host, HostListener, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draggable-modal',
  imports: [CommonModule],
  templateUrl: './draggable-modal.component.html',
  styleUrl: './draggable-modal.component.scss'
})
export class DraggableModalComponent {
  @Input() title: string = 'Modal title';
  @Input() isVisible: boolean = false;
  @Input() closeOnBackdrop: boolean = true;

  @ViewChild('modalElement') modalElement!: ElementRef;
  @ViewChild('modalHeader') modalHeader!: ElementRef;

  modalTop: number = 100;
  modalLeft: number = 100;

  private isDragging: boolean = false;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor() { }

  public open(): void {
    setTimeout(() => {
      if (this.modalElement)
      {
        const rect = this.modalElement.nativeElement.getBoundingClientRect();
        this.modalTop = (window.innerHeight - rect.height) / 2;
        this.modalLeft = (window.innerWidth - rect.width) / 2;
      }
    });
    this.isVisible = true;
  }

  public close(): void {
    this.isVisible = false;
  }

  startDragging(event: MouseEvent): void 
  {
    this.isDragging = true;

    const rect = this.modalElement.nativeElement.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;

    this.modalHeader.nativeElement.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void
  {
    if (!this.isDragging) return;
    
    let newTop = event.clientY - this.offsetY;
    let newLeft = event.clientX - this.offsetX;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalRect = this.modalElement.nativeElement.getBoundingClientRect();

    newTop = Math.max(0, Math.min(viewportHeight - modalRect.height, newTop));
    newLeft = Math.max(0, Math.min(viewportWidth - modalRect.width, newLeft));

    this.modalTop = newTop;
    this.modalLeft = newLeft;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void 
  {
    this.isDragging = false;
    if (this.modalHeader)
    {
      this.modalHeader.nativeElement.style.userSelect = '';
    }
  }
}
