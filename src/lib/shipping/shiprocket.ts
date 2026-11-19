/**
 * Official Shiprocket Logistics & Tracking Client
 * Handles Authentication, Adhoc Order Creation, Courier Assignment (AWB generation),
 * Live Milestone Tracking, and Branded Tracking Page URL resolution.
 */

interface ShiprocketAuthResponse {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  token?: string;
  expires_in?: number;
  message?: string;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number | string;
  discount?: number | string;
  tax?: number | string;
  hsn?: number | string;
}

export interface CreateShiprocketOrderParams {
  orderId: string;
  orderDate?: string; // YYYY-MM-DD HH:mm
  pickupLocation?: string;
  channelId?: string;
  comment?: string;
  customerName: string;
  customerLastName?: string;
  address: string;
  address2?: string;
  city: string;
  pincode: string;
  state: string;
  country?: string;
  email: string;
  phone: string;
  items: ShiprocketOrderItem[];
  paymentMethod: 'Prepaid' | 'COD';
  subtotal: number;
  shippingCharges?: number;
  discount?: number;
  length?: number; // cm (default: 10)
  breadth?: number; // cm (default: 10)
  height?: number; // cm (default: 5)
  weight?: number; // kg (default: 0.5)
}

export interface ShiprocketCreateOrderResponse {
  success: boolean;
  orderId?: number;
  shipmentId?: number;
  status?: string;
  statusCode?: number;
  error?: string;
  raw?: any;
}

export interface ShiprocketAwbResponse {
  success: boolean;
  awbCode?: string;
  courierName?: string;
  courierCompanyId?: number;
  trackingUrl?: string;
  error?: string;
  raw?: any;
}

export interface ShiprocketTrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  srStatus?: string;
}

export interface ShiprocketTrackingResponse {
  success: boolean;
  currentStatus?: string;
  currentStatusCode?: number;
  courierName?: string;
  awbCode?: string;
  etd?: string;
  activities?: ShiprocketTrackingActivity[];
  trackingUrl?: string;
  error?: string;
}

class ShiprocketClient {
  private baseUrl = 'https://apiv2.shiprocket.in/v2/console';
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /**
   * Retrieves an active JWT Bearer token from Shiprocket.
   * Caches in-memory token for up to 9 days (Shiprocket tokens expire in 10 days).
   */
  async getAuthToken(): Promise<string> {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'Shiprocket credentials missing. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in your environment.'
      );
    }

    // Return cached token if valid with at least 1 hour safety margin
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 3600 * 1000) {
      return this.cachedToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      });

      const data: ShiprocketAuthResponse = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || `Authentication failed with status ${response.status}`);
      }

      this.cachedToken = data.token;
      // 9 days TTL (in milliseconds)
      this.tokenExpiresAt = Date.now() + (data.expires_in ? data.expires_in * 1000 : 9 * 24 * 60 * 60 * 1000);

      return this.cachedToken;
    } catch (err: any) {
      console.error('[Shiprocket Auth Error]:', err.message || err);
      throw err;
    }
  }

  /**
   * Formats a branded tracking page URL for the customer.
   * If SHIPROCKET_BRAND_DOMAIN is set (e.g. "lexido.shiprocket.co" or "track.lexido.in"),
   * returns that customized destination. Otherwise falls back to official tracking URL.
   */
  getBrandedTrackingUrl(awbOrOrderId: string): string {
    const brandDomain = process.env.SHIPROCKET_BRAND_DOMAIN?.trim();
    if (brandDomain) {
      const cleanDomain = brandDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `https://${cleanDomain}/${awbOrOrderId}`;
    }
    return `https://shiprocket.co//tracking/${awbOrOrderId}`;
  }

  /**
   * Creates an adhoc custom order on Shiprocket.
   */
  async createOrder(params: CreateShiprocketOrderParams): Promise<ShiprocketCreateOrderResponse> {
    try {
      const token = await this.getAuthToken();
      const pickupLocation =
        params.pickupLocation || process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

      const now = new Date();
      const defaultOrderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Clean and sanitize phone number (10 digits for India)
      const cleanPhone = params.phone.replace(/[^0-9]/g, '').slice(-10);

      const payload = {
        order_id: params.orderId,
        order_date: params.orderDate || defaultOrderDate,
        pickup_location: pickupLocation,
        channel_id: params.channelId || '',
        comment: params.comment || 'LEXIDO Storefront Dispatch',
        billing_customer_name: params.customerName.slice(0, 30),
        billing_last_name: (params.customerLastName || '').slice(0, 30),
        billing_address: params.address.slice(0, 100),
        billing_address_2: (params.address2 || '').slice(0, 100),
        billing_city: params.city,
        billing_pincode: params.pincode.replace(/[^0-9]/g, ''),
        billing_state: params.state,
        billing_country: params.country || 'India',
        billing_email: params.email,
        billing_phone: cleanPhone,
        shipping_is_billing: true,
        order_items: params.items.map((item) => ({
          name: item.name.slice(0, 100),
          sku: item.sku || 'SKU-DEFAULT',
          units: item.units,
          selling_price: item.selling_price,
          discount: item.discount ?? 0,
          tax: item.tax ?? 0,
          hsn: item.hsn ?? 6109,
        })),
        payment_method: params.paymentMethod,
        shipping_charges: params.shippingCharges ?? 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: params.discount ?? 0,
        sub_total: params.subtotal,
        length: params.length ?? 10,
        breadth: params.breadth ?? 10,
        height: params.height ?? 5,
        weight: params.weight ?? 0.5,
      };

      const response = await fetch(`${this.baseUrl}/data/orders/create/adhoc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data.order_id) {
        return {
          success: false,
          error: data.message || `Failed to create order on Shiprocket (HTTP ${response.status})`,
          raw: data,
        };
      }

      return {
        success: true,
        orderId: data.order_id,
        shipmentId: data.shipment_id,
        status: data.status,
        statusCode: data.status_code,
        raw: data,
      };
    } catch (err: any) {
      console.error('[Shiprocket Create Order Error]:', err.message || err);
      return {
        success: false,
        error: err.message || 'An unexpected network error occurred while connecting to Shiprocket.',
      };
    }
  }

  /**
   * Generates AWB (Air Waybill) and assigns a courier partner (Delhivery, Blue Dart, DTDC, etc.)
   */
  async generateAwb(shipmentId: number | string, courierId?: number | string): Promise<ShiprocketAwbResponse> {
    try {
      const token = await this.getAuthToken();
      const payload: Record<string, any> = { shipment_id: shipmentId };
      if (courierId) {
        payload.courier_id = courierId;
      }

      const response = await fetch(`${this.baseUrl}/courier/assign/awb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const data = await response.json();

      const awbData = data?.response?.data;
      if (!response.ok || !awbData?.awb_code) {
        return {
          success: false,
          error: data?.message || data?.response?.data?.message || 'Courier/AWB assignment failed.',
          raw: data,
        };
      }

      const awbCode = awbData.awb_code;
      const courierName = awbData.courier_name || 'Carrier Partner';

      return {
        success: true,
        awbCode,
        courierName,
        courierCompanyId: awbData.courier_company_id,
        trackingUrl: this.getBrandedTrackingUrl(awbCode),
        raw: data,
      };
    } catch (err: any) {
      console.error('[Shiprocket Generate AWB Error]:', err.message || err);
      return {
        success: false,
        error: err.message || 'Failed to assign courier partner via Shiprocket.',
      };
    }
  }

  /**
   * Queries real-time tracking milestones from Shiprocket via AWB code.
   */
  async trackAwb(awbCode: string): Promise<ShiprocketTrackingResponse> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.baseUrl}/courier/track/awb/${encodeURIComponent(awbCode)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data.tracking_data) {
        return {
          success: false,
          error: data.message || 'Tracking telemetry currently unavailable for this AWB.',
        };
      }

      const trackData = data.tracking_data;
      const trackObj = trackData.shipment_track?.[0] || {};
      const activities: ShiprocketTrackingActivity[] = (trackData.shipment_track_activities || []).map(
        (act: any) => ({
          date: act.date,
          status: act.status,
          activity: act.activity,
          location: act.location,
          srStatus: act['sr-status'],
        })
      );

      return {
        success: true,
        currentStatus: trackObj.current_status || 'IN TRANSIT',
        courierName: trackObj.courier_name || 'Assigned Carrier',
        awbCode: trackObj.awb_code || awbCode,
        etd: trackObj.edd || trackObj.expected_date,
        activities,
        trackingUrl: this.getBrandedTrackingUrl(awbCode),
      };
    } catch (err: any) {
      console.error('[Shiprocket Track AWB Error]:', err.message || err);
      return {
        success: false,
        error: err.message || 'Failed to query live tracking telemetry from Shiprocket.',
      };
    }
  }

  /**
   * Request pickup from the pickup warehouse address.
   */
  async requestPickup(shipmentId: number | string): Promise<{ success: boolean; pickupToken?: string; error?: string }> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/courier/generate/pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: [shipmentId] }),
        cache: 'no-store',
      });

      const data = await response.json();
      if (!response.ok || data.status !== 1) {
        return {
          success: false,
          error: data.message || 'Failed to request courier pickup.',
        };
      }

      return {
        success: true,
        pickupToken: data.response?.pickup_token_number,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to schedule courier pickup.',
      };
    }
  }
}

export const shiprocketClient = new ShiprocketClient();
export default shiprocketClient;
