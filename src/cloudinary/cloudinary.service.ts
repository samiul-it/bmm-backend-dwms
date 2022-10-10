import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async deleteImage(public_id: string) {
    return await v2.uploader.destroy(public_id, {}, (err: any, res: any) => {
      // console.log('cloudinary delete Error ======>', err);
      // console.log('cloudinary delete Success ======>', res);
      if (err) throw new InternalServerErrorException(err);
      return res;
    });
  }
}
