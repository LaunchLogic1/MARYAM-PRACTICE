import { Product, BRAND_CONFIG } from '../types';

export interface WhatsAppOrderParams {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  customNote?: string;
}

/**
 * Formats a clean, professional WhatsApp order/inquiry message.
 */
export function generateWhatsAppMessage(params: WhatsAppOrderParams): string {
  const { product, selectedSize, selectedColor, customNote } = params;
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const priceDisplay = product.price 
    ? `${BRAND_CONFIG.currencySymbol} ${product.price.toLocaleString()}` 
    : 'Price on Inquiry';

  let message = `Hello Maryam Trade Center!\n\n`;
  message += `I would like to order/inquire about this product:\n\n`;
  message += `• Product: ${product.name}\n`;
  message += `• Category: ${product.categoryLabel}\n`;
  message += `• Price: ${priceDisplay}\n`;
  message += `• Product Code (SKU): ${product.sku}\n`;

  if (selectedSize) {
    message += `• Size: ${selectedSize}\n`;
  }

  if (selectedColor) {
    message += `• Color: ${selectedColor}\n`;
  }

  if (currentUrl) {
    message += `• Product Link: ${currentUrl}\n`;
  }

  if (customNote && customNote.trim()) {
    message += `• Note: ${customNote.trim()}\n`;
  }

  message += `\nPlease confirm availability and ordering details.\nThank you!`;

  return message;
}

/**
 * Builds the WhatsApp deep link URL.
 */
export function getWhatsAppOrderUrl(params: WhatsAppOrderParams): string {
  const phoneNumber = params.product.whatsappNumber || BRAND_CONFIG.whatsappRaw;
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const message = generateWhatsAppMessage(params);
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a general inquiry WhatsApp URL.
 */
export function getGeneralWhatsAppInquiryUrl(customMessage?: string): string {
  const cleanPhone = BRAND_CONFIG.whatsappRaw.replace(/[^0-9]/g, '');
  const text = customMessage || `Hello Maryam Trade Center! I would like to inquire about your fashion collection and accessories.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Opens WhatsApp safely in a new window/tab.
 */
export function openWhatsApp(url: string) {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
