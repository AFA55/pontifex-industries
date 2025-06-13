// src/types/bluetooth.d.ts - COMPLETE MANUAL DEFINITIONS

// Extend the global Navigator interface
declare global {
  interface Navigator {
    bluetooth?: Bluetooth;
  }
}

// Core Bluetooth interfaces
interface Bluetooth extends EventTarget {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  getDevices(): Promise<BluetoothDevice[]>;
  getAvailability(): Promise<boolean>;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface BluetoothDevice extends EventTarget {
  readonly id: string;
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
  readonly uuids?: string[];
  watchAdvertisements(): Promise<void>;
  unwatchAdvertisements(): void;
  forget(): Promise<void>;
  addEventListener(type: 'advertisementreceived' | 'gattserverdisconnected', listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: 'advertisementreceived' | 'gattserverdisconnected', listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface BluetoothRemoteGATTServer {
  readonly device: BluetoothDevice;
  readonly connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
  getPrimaryServices(service?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothRemoteGATTService extends EventTarget {
  readonly device: BluetoothDevice;
  readonly uuid: string;
  readonly isPrimary: boolean;
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic[]>;
  getIncludedService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
  getIncludedServices(service?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly service: BluetoothRemoteGATTService;
  readonly uuid: string;
  readonly properties: BluetoothCharacteristicProperties;
  readonly value?: DataView;
  readValue(): Promise<DataView>;
  writeValue(value: BufferSource): Promise<void>;
  writeValueWithResponse(value: BufferSource): Promise<void>;
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  getDescriptor(descriptor: BluetoothDescriptorUUID): Promise<BluetoothRemoteGATTDescriptor>;
  getDescriptors(descriptor?: BluetoothDescriptorUUID): Promise<BluetoothRemoteGATTDescriptor[]>;
  addEventListener(type: 'characteristicvaluechanged', listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: 'characteristicvaluechanged', listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface BluetoothCharacteristicProperties {
  readonly authenticatedSignedWrites: boolean;
  readonly broadcast: boolean;
  readonly indicate: boolean;
  readonly notify: boolean;
  readonly read: boolean;
  readonly reliableWrite: boolean;
  readonly writableAuxiliaries: boolean;
  readonly write: boolean;
  readonly writeWithoutResponse: boolean;
}

interface BluetoothRemoteGATTDescriptor {
  readonly characteristic: BluetoothRemoteGATTCharacteristic;
  readonly uuid: string;
  readonly value?: DataView;
  readValue(): Promise<DataView>;
  writeValue(value: BufferSource): Promise<void>;
}

// Type aliases for UUIDs
type BluetoothServiceUUID = number | string;
type BluetoothCharacteristicUUID = number | string;
type BluetoothDescriptorUUID = number | string;

// Request device options
type RequestDeviceOptions = {
  filters: BluetoothLEScanFilter[];
  optionalServices?: BluetoothServiceUUID[];
  optionalManufacturerData?: number[];
} | {
  acceptAllDevices: boolean;
  optionalServices?: BluetoothServiceUUID[];
  optionalManufacturerData?: number[];
};

interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
  manufacturerData?: BluetoothManufacturerDataFilter[];
  serviceData?: BluetoothServiceDataFilter[];
}

interface BluetoothManufacturerDataFilter {
  companyIdentifier: number;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

interface BluetoothServiceDataFilter {
  service: BluetoothServiceUUID;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

// Advertisement events
interface BluetoothAdvertisingEvent extends Event {
  readonly device: BluetoothDevice;
  readonly uuids: string[];
  readonly manufacturerData: Map<number, DataView>;
  readonly serviceData: Map<string, DataView>;
  readonly name?: string;
  readonly appearance?: number;
  readonly txPower?: number;
  readonly rssi?: number;
}

// Export empty object to make this a module
export {};