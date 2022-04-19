import { sendEmail } from '../services/EmailNotification';

export function reportError(error, assetKey) {
   console.log('ReportError send EMail!!!! :>> ');
   sendEmail('Page observation error', `Observation stopped for ${assetKey}: ${error}`);
}
