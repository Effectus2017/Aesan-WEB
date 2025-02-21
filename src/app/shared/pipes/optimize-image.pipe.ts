import { Pipe, PipeTransform } from '@angular/core';
import { ImageService } from '../services/image.service';

@Pipe({
    name: 'optimizeImage',
    standalone: true
})
export class OptimizeImagePipe implements PipeTransform {
    constructor(private imageService: ImageService) {}

    transform(url: string, width?: number): string {
        return this.imageService.optimizeImageUrl(url, width);
    }
}
