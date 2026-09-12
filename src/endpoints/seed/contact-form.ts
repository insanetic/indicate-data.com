import type { Form } from '@/payload-types'

export const contactForm: Omit<Form, 'createdAt' | 'id' | 'updatedAt'> = {
  title: 'Kontaktformular',
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Danke für Ihre Nachricht. Wir melden uns innerhalb eines Werktags.',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  emails: [
    {
      emailFrom: '"Indicate Data" <hello@indicate-data.io>',
      emailTo: 'hello@indicate-data.io',
      subject: 'Neue Kontaktanfrage über die Website',
      message: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Neue Anfrage: {{name}}, {{email}}, {{hotel}}',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
  ],
  fields: [
    { name: 'name', blockName: 'name', blockType: 'text', label: 'Name', required: true, width: 50 },
    { name: 'email', blockName: 'email', blockType: 'email', label: 'E-Mail', required: true, width: 50 },
    { name: 'hotel', blockName: 'hotel', blockType: 'text', label: 'Hotel oder Unternehmen', required: false, width: 100 },
    {
      name: 'message',
      blockName: 'message',
      blockType: 'textarea',
      label: 'Wie können wir helfen?',
      required: true,
      width: 100,
    },
  ],
  submitButtonLabel: 'Nachricht senden',
}
