/**
 * CDNImage — image element that gracefully falls back to the original URL
 * if the wsrv.nl CDN ever fails.
 */
import { useState, ImgHTMLAttributes } from 'react';
import { cdnize } from '@/utils/urlUtils';

interface CDNImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  kind?: 'poster' | 'backdrop' | 'thumb';
}

export const CDNImage = ({ src, kind = 'poster', onError, ...rest }: CDNImageProps) => {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src?.startsWith('http') ? src : cdnize(src, kind);

  return (
    <img
      {...rest}
      src={finalSrc}
      loading={rest.loading ?? 'lazy'}
      decoding={rest.decoding ?? 'async'}
      onError={(e) => {
        if (!errored) setErrored(true);
        onError?.(e);
      }}
    />
  );
};

export default CDNImage;
