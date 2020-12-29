import { AuthCredentials } from './auth';
import { Manager } from './manager';
import { idResource } from './resource';

export interface Attachment {
  content_type: string;
  data: string;
  digest: string;
  revpos: number;
}

export type AttachmentStub = Attachment & {
  stub: true;
};

export type AttachmentRelated = Attachment & {
  follows: true;
};

export interface AttachmentList {
  [k: string]: Attachment | AttachmentStub | AttachmentRelated;
}

export const attachment = <T = any>(
  uri: string,
  auth?: AuthCredentials,
): ((file: string) => Manager<T>) => (file: string) => {
  const fileUri = `${uri}/${file}`;
  const { read, create, update, destroy } = idResource(fileUri, auth);
  return {
    read: (options: any = {}) =>
      read({
        ...options,
        headers: {
          ...(options.headers || {}),
          'content-type': options.contentType,
        },
      }),
    create: (options) => create({ ...options, raw: true }),
    update: (options) => update({ ...options, raw: true }),
    destroy,
  };
};
