import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QrScannerService } from './qr-scanner.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  eventId = 'event-1';
  
  scanCount = 12;
  successRate = 97;
  isCameraActive = false;
  lastScanResult: any = null;
  cameraError = '';
  private stream: MediaStream | null = null;
  
  recentScans: any[] = [
    { id: 1, volunteerName: 'Sarah Johnson', qrCode: 'QR-2024-001', timestamp: '08:45 AM', status: 'success' },
    { id: 2, volunteerName: 'Michael Chen', qrCode: 'QR-2024-002', timestamp: '08:52 AM', status: 'success' },
    { id: 3, volunteerName: 'David Thompson', qrCode: 'QR-2024-003', timestamp: '09:02 AM', status: 'success' },
    { id: 4, volunteerName: 'Jessica Williams', qrCode: 'QR-2024-004', timestamp: '09:15 AM', status: 'success' },
    { id: 5, volunteerName: 'Maria Garcia', qrCode: 'QR-2024-005', timestamp: '09:28 AM', status: 'success' },
  ];

  // Simulate QR codes for testing
  mockQRCodes = [
    { id: 1, volunteerName: 'Sarah Johnson', qrCode: 'QR-2024-001' },
    { id: 2, volunteerName: 'Michael Chen', qrCode: 'QR-2024-002' },
    { id: 3, volunteerName: 'David Thompson', qrCode: 'QR-2024-003' },
    { id: 4, volunteerName: 'Jessica Williams', qrCode: 'QR-2024-004' },
    { id: 5, volunteerName: 'Maria Garcia', qrCode: 'QR-2024-005' },
  ];

  constructor(private qrScannerService: QrScannerService) {}

  ngOnInit() {
    this.loadSessionStats();
  }

  ngAfterViewInit() {
    // Camera setup happens in startCamera
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  loadSessionStats() {
    // Using dummy data - would call service in production
    // this.qrScannerService.getSessionStats(this.eventId).subscribe(data => {
    //   this.scanCount = data.scanned;
    //   this.successRate = data.successRate;
    // });
  }

  loadRecentScans() {
    // Using local dummy data
    // Would call: this.qrScannerService.getRecentScans(this.eventId).subscribe(...);
  }

  simulateScan() {
    // Simulate scanning a random QR code
    const randomQR = this.mockQRCodes[Math.floor(Math.random() * this.mockQRCodes.length)];
    this.processScan(randomQR);
  }

  processScan(qrData: any) {
    this.lastScanResult = { 
      success: true, 
      message: `✓ ${qrData.volunteerName} checked in successfully!`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    
    // Add to recent scans
    this.recentScans.unshift({
      id: this.recentScans.length + 1,
      volunteerName: qrData.volunteerName,
      qrCode: qrData.qrCode,
      timestamp: this.lastScanResult.timestamp,
      status: 'success'
    });

    // Keep only last 5 scans
    if (this.recentScans.length > 5) {
      this.recentScans.pop();
    }

    this.scanCount++;
    this.showNotification(this.lastScanResult.message, 'success');
  }

  private showNotification(message: string, type: string) {
    // This would normally show a toast notification
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  async startCamera() {
    this.cameraError = '';
    try {
      // Request camera permissions
      const constraints = {
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Wait for view to be initialized
      setTimeout(() => {
        if (this.videoElement && this.stream) {
          this.videoElement.nativeElement.srcObject = this.stream;
          this.videoElement.nativeElement.play().catch(err => {
            console.error('Error playing video:', err);
            this.cameraError = 'Unable to play video stream';
          });
          this.isCameraActive = true;
        }
      }, 100);
      
    } catch (error: any) {
      this.isCameraActive = false;
      if (error.name === 'NotAllowedError') {
        this.cameraError = 'Camera permission denied. Please enable camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        this.cameraError = 'No camera device found on this device.';
      } else if (error.name === 'NotReadableError') {
        this.cameraError = 'Camera is already in use by another application.';
      } else {
        this.cameraError = `Camera error: ${error.message}`;
      }
      console.error('Camera error:', error);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive = false;
    this.cameraError = '';
  }
}
