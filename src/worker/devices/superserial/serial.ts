// Super Serial Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)

import { interruptRequest } from "../../cpu6502"
import { passTxCommData } from "../../worker2main"
import { setSlotDriver, setSlotIOCallback } from "../../memory"
import { SY6551, SY6551Ext, ConfigChange } from "./sy6551"

//  Apple II Super Serial Card ROM - 341-0065-A.bin
const rom = new Uint8Array([
  0x20, 0x9b, 0xc9, 0xa9, 0x16, 0x48, 0xa9, 0x00, 0x9d, 0xb8, 0x04, 
  0x9d, 0xb8, 0x03, 0x9d, 0x38, 0x04, 0x9d, 0xb8, 0x05, 0x9d, 0x38, 
  0x06, 0x9d, 0xb8, 0x06, 0xb9, 0x82, 0xc0, 0x85, 0x2b, 0x4a, 0x4a, 
  0x90, 0x04, 0x68, 0x29, 0xfe, 0x48, 0xb8, 0xb9, 0x81, 0xc0, 0x4a, 
  0xb0, 0x07, 0x4a, 0xb0, 0x0e, 0xa9, 0x01, 0xd0, 0x3d, 0x4a, 0xa9, 
  0x03, 0xb0, 0x02, 0xa9, 0x80, 0x9d, 0xb8, 0x04, 0x2c, 0x58, 0xff, 
  0xa5, 0x2b, 0x29, 0x20, 0x49, 0x20, 0x9d, 0xb8, 0x03, 0x70, 0x0a, 
  0x20, 0x9b, 0xc8, 0xae, 0xf8, 0x07, 0x9d, 0xb8, 0x05, 0x60, 0xa5, 
  0x2b, 0x4a, 0x4a, 0x29, 0x03, 0xa8, 0xf0, 0x04, 0x68, 0x29, 0x7f, 
  0x48, 0xb9, 0xa6, 0xc9, 0x9d, 0x38, 0x06, 0xa4, 0x26, 0x68, 0x29, 
  0x95, 0x48, 0xa9, 0x09, 0x9d, 0x38, 0x05, 0x68, 0x9d, 0x38, 0x07, 
  0xa5, 0x2b, 0x48, 0x29, 0xa0, 0x50, 0x02, 0x29, 0x80, 0x20, 0xa1, 
  0xcd, 0x20, 0x81, 0xcd, 0x68, 0x29, 0x0c, 0x50, 0x02, 0xa9, 0x00, 
  0x0a, 0x0a, 0x0a, 0x09, 0x0b, 0x99, 0x8a, 0xc0, 0xb9, 0x88, 0xc0, 
  0x60, 0x20, 0x9b, 0xc9, 0x20, 0xaa, 0xc8, 0x29, 0x7f, 0xac, 0xf8, 
  0x07, 0xbe, 0xb8, 0x05, 0x60, 0x20, 0xff, 0xca, 0xb0, 0x05, 0x20, 
  0x2c, 0xcc, 0x90, 0xf6, 0x60, 0x20, 0x1e, 0xca, 0x68, 0xa8, 0x68, 
  0xaa, 0xa5, 0x27, 0x60, 0xf0, 0x29, 0xbd, 0xb8, 0x06, 0x10, 0x05, 
  0x5e, 0xb8, 0x06, 0xd0, 0x24, 0x20, 0x3e, 0xcc, 0x90, 0x1a, 0xbd, 
  0xb8, 0x03, 0x29, 0xc0, 0xf0, 0x0e, 0xa5, 0x27, 0xc9, 0xe0, 0x90, 
  0x08, 0xbd, 0xb8, 0x04, 0x09, 0x40, 0x9d, 0xb8, 0x04, 0x28, 0xf0, 
  0xd0, 0xd0, 0xcb, 0x20, 0xff, 0xca, 0x90, 0xdc, 0x20, 0x11, 0xcc, 
  0x28, 0x08, 0xf0, 0xda, 0x20, 0xd1, 0xc9, 0x4c, 0xd0, 0xc8, 0x20, 
  0x1a, 0xcb, 0xb0, 0xb7, 0xa5, 0x27, 0x48, 0xbd, 0x38, 0x07, 0x29, 
  0xc0, 0xd0, 0x16, 0xa5, 0x24, 0xf0, 0x42, 0xc9, 0x08, 0xf0, 0x04, 
  0xc9, 0x10, 0xd0, 0x0a, 0x09, 0xf0, 0x3d, 0xb8, 0x06, 0x18, 0x65, 
  0x24, 0x85, 0x24, 0xbd, 0xb8, 0x06, 0xc5, 0x24, 0xf0, 0x29, 0xa9, 
  0xa0, 0x90, 0x08, 0xbd, 0x38, 0x07, 0x0a, 0x10, 0x1f, 0xa9, 0x88, 
  0x85, 0x27, 0x2c, 0x58, 0xff, 0x08, 0x70, 0x0c, 0xea, 0x2c, 0x58, 
  0xff, 0x50, 0xb8, 0xae, 0xf8, 0x07, 0x4c, 0xef, 0xc9, 0x20, 0xb5, 
  0xc9, 0x20, 0x6b, 0xcb, 0x4c, 0x68, 0xc9, 0x68, 0xb8, 0x08, 0x85, 
  0x27, 0x48, 0x20, 0x68, 0xcb, 0x20, 0xb5, 0xc9, 0x68, 0x49, 0x8d, 
  0x0a, 0xd0, 0x05, 0x9d, 0xb8, 0x06, 0x85, 0x24, 0xbd, 0xb8, 0x04, 
  0x10, 0x0d, 0xbd, 0x38, 0x06, 0xf0, 0x08, 0x18, 0xfd, 0xb8, 0x06, 
  0xa9, 0x8d, 0x90, 0xda, 0x28, 0x70, 0xa4, 0xbd, 0x38, 0x07, 0x30, 
  0x16, 0xbc, 0xb8, 0x06, 0x0a, 0x30, 0x0e, 0x98, 0xa0, 0x00, 0x38, 
  0xfd, 0x38, 0x06, 0xc9, 0xf8, 0x90, 0x03, 0x69, 0x27, 0xa8, 0x84, 
  0x24, 0x4c, 0xb8, 0xc8, 0x8e, 0xf8, 0x07, 0x84, 0x26, 0xa9, 0x00, 
  0x9d, 0xb8, 0x05, 0x60, 0x29, 0x48, 0x50, 0x84, 0x85, 0x27, 0x20, 
  0x9b, 0xc9, 0x20, 0x63, 0xcb, 0x4c, 0xa3, 0xc8, 0xa5, 0x27, 0x49, 
  0x08, 0x0a, 0xf0, 0x04, 0x49, 0xee, 0xd0, 0x09, 0xde, 0xb8, 0x06, 
  0x10, 0x03, 0x9d, 0xb8, 0x06, 0x60, 0xc9, 0xc0, 0xb0, 0xfb, 0xfe, 
  0xb8, 0x06, 0x60, 0xbd, 0x38, 0x07, 0x29, 0x08, 0xf0, 0x16, 0xbd, 
  0xb8, 0x04, 0xa4, 0x27, 0xc0, 0x94, 0xd0, 0x04, 0x09, 0x80, 0xd0, 
  0x06, 0xc0, 0x92, 0xd0, 0x05, 0x29, 0x7f, 0x9d, 0xb8, 0x04, 0x60, 
  0x8a, 0x0a, 0x0a, 0x0a, 0x0a, 0x85, 0x26, 0xa9, 0x00, 0x9d, 0xb8, 
  0x05, 0x70, 0x0f, 0xa0, 0x00, 0xb1, 0x3c, 0x85, 0x27, 0x20, 0x02, 
  0xcc, 0x20, 0xba, 0xfc, 0x90, 0xf2, 0x60, 0x20, 0xd2, 0xca, 0x90, 
  0xfb, 0xb9, 0x88, 0xc0, 0xa0, 0x00, 0x91, 0x3c, 0x20, 0xba, 0xfc, 
  0x90, 0xef, 0x60, 0xbd, 0xb8, 0x04, 0x10, 0x31, 0xa9, 0x02, 0x48, 
  0xa9, 0x7f, 0x20, 0xe2, 0xcd, 0xa4, 0x24, 0xb1, 0x28, 0x85, 0x27, 
  0xa9, 0x07, 0x25, 0x4f, 0xd0, 0x10, 0xa4, 0x24, 0xa9, 0xdf, 0xd1, 
  0x28, 0xd0, 0x02, 0xa5, 0x27, 0x91, 0x28, 0xe6, 0x4f, 0xe6, 0x4f, 
  0xbd, 0xb8, 0x04, 0x30, 0x09, 0x20, 0x11, 0xcc, 0x68, 0xa9, 0x8d, 
  0x85, 0x27, 0x60, 0x20, 0xff, 0xca, 0x90, 0x0c, 0x20, 0x11, 0xcc, 
  0x20, 0xd1, 0xc9, 0x20, 0xa3, 0xcc, 0x4c, 0x2b, 0xca, 0x20, 0x3e, 
  0xcc, 0x90, 0xc6, 0x70, 0xbe, 0xbd, 0x38, 0x07, 0x0a, 0x10, 0x22, 
  0x68, 0xa8, 0xa5, 0x27, 0xc0, 0x01, 0xf0, 0x20, 0xb0, 0x34, 0xc9, 
  0x9b, 0xd0, 0x06, 0xc8, 0x98, 0x48, 0x4c, 0x2b, 0xca, 0xc9, 0xc1, 
  0x90, 0x08, 0xc9, 0xdb, 0xb0, 0x04, 0x09, 0x20, 0x85, 0x27, 0x98, 
  0x48, 0x20, 0x68, 0xcb, 0x4c, 0x2b, 0xca, 0xc9, 0x9b, 0xf0, 0xe2, 
  0xc9, 0xb0, 0x90, 0x0a, 0xc9, 0xbb, 0xb0, 0x06, 0xa8, 0xb9, 0x09, 
  0xca, 0x85, 0x27, 0xa0, 0x00, 0xf0, 0xe2, 0xc9, 0x9b, 0xd0, 0xde, 
  0xa0, 0x00, 0xf0, 0xc9, 0x9b, 0x9c, 0x9f, 0xdb, 0xdc, 0xdf, 0xfb, 
  0xfc, 0xfd, 0xfe, 0xff, 0xa2, 0xca, 0xca, 0xd0, 0xfd, 0x38, 0xe9, 
  0x01, 0xd0, 0xf6, 0xae, 0xf8, 0x07, 0x60, 0xa4, 0x26, 0xb9, 0x89, 
  0xc0, 0x48, 0x29, 0x20, 0x4a, 0x4a, 0x85, 0x35, 0x68, 0x29, 0x0f, 
  0xc9, 0x08, 0x90, 0x04, 0x29, 0x07, 0xb0, 0x02, 0xa5, 0x35, 0x05, 
  0x35, 0xf0, 0x05, 0x09, 0x20, 0x9d, 0xb8, 0x05, 0x60, 0xa4, 0x26, 
  0xb9, 0x89, 0xc0, 0x29, 0x70, 0xc9, 0x10, 0x60, 0x20, 0xd2, 0xca, 
  0x90, 0x15, 0xb9, 0x88, 0xc0, 0x09, 0x80, 0xc9, 0x8a, 0xd0, 0x09, 
  0xa8, 0xbd, 0x38, 0x07, 0x29, 0x20, 0xd0, 0x03, 0x98, 0x38, 0x60, 
  0x18, 0x60, 0xa4, 0x26, 0xb9, 0x81, 0xc0, 0x4a, 0xb0, 0x36, 0xbd, 
  0xb8, 0x04, 0x29, 0x07, 0xf0, 0x05, 0x20, 0xfc, 0xcd, 0x38, 0x60, 
  0xa5, 0x27, 0x29, 0x7f, 0xdd, 0x38, 0x05, 0xd0, 0x05, 0xfe, 0xb8, 
  0x04, 0x38, 0x60, 0xbd, 0x38, 0x07, 0x29, 0x08, 0xf0, 0x15, 0x20, 
  0xff, 0xca, 0x90, 0x10, 0xc9, 0x93, 0xf0, 0x0e, 0x48, 0xbd, 0x38, 
  0x07, 0x4a, 0x4a, 0x68, 0x90, 0x04, 0x9d, 0xb8, 0x06, 0x18, 0x60, 
  0x20, 0xaa, 0xc8, 0xc9, 0x91, 0xd0, 0xf9, 0x18, 0x60, 0x20, 0x1a, 
  0xcb, 0xb0, 0xf1, 0x20, 0x9e, 0xcc, 0xa4, 0x26, 0xb9, 0x81, 0xc0, 
  0x4a, 0x90, 0x4e, 0x4a, 0x90, 0x4b, 0xa5, 0x27, 0x48, 0xbd, 0x38, 
  0x04, 0xc9, 0x67, 0x90, 0x10, 0xc9, 0x6c, 0xb0, 0x22, 0xc9, 0x6b, 
  0x68, 0x48, 0x49, 0x9b, 0x29, 0x7f, 0xd0, 0x18, 0xb0, 0x19, 0xbd, 
  0xb8, 0x04, 0x29, 0x1f, 0x09, 0x80, 0x85, 0x27, 0x20, 0x02, 0xcc, 
  0x20, 0xaa, 0xc8, 0x49, 0x86, 0xd0, 0xed, 0x9d, 0x38, 0x04, 0xde, 
  0x38, 0x04, 0x68, 0x85, 0x27, 0x49, 0x8d, 0x0a, 0xd0, 0x0a, 0xbd, 
  0xb8, 0x03, 0x29, 0x30, 0xf0, 0x03, 0x9d, 0x38, 0x04, 0x20, 0x02, 
  0xcc, 0x4c, 0xea, 0xcb, 0x20, 0x02, 0xcc, 0x0a, 0xa8, 0xbd, 0xb8, 
  0x03, 0xc0, 0x18, 0xf0, 0x0c, 0x4a, 0x4a, 0xc0, 0x14, 0xf0, 0x06, 
  0x4a, 0x4a, 0xc0, 0x1a, 0xd0, 0x25, 0x29, 0x03, 0xf0, 0x0d, 0xa8, 
  0xb9, 0xfe, 0xcb, 0xa8, 0xa9, 0x20, 0x20, 0xc4, 0xca, 0x88, 0xd0, 
  0xf8, 0xa5, 0x27, 0x0a, 0xc9, 0x1a, 0xd0, 0x0d, 0xbd, 0x38, 0x07, 
  0x6a, 0x90, 0x07, 0xa9, 0x8a, 0x85, 0x27, 0x4c, 0x6b, 0xcb, 0x60, 
  0x01, 0x08, 0x40, 0x20, 0xf5, 0xca, 0xd0, 0xfb, 0x98, 0x09, 0x89, 
  0xa8, 0xa5, 0x27, 0x99, 0xff, 0xbf, 0x60, 0x48, 0xa4, 0x24, 0xa5, 
  0x27, 0x91, 0x28, 0x68, 0xc9, 0x95, 0xd0, 0x0c, 0xa5, 0x27, 0xc9, 
  0x20, 0xb0, 0x06, 0x20, 0xdf, 0xcc, 0x59, 0xdb, 0xcc, 0x85, 0x27, 
  0x60, 0x18, 0xbd, 0x38, 0x07, 0x29, 0x04, 0xf0, 0x09, 0xad, 0x00, 
  0xc0, 0x10, 0x04, 0x8d, 0x10, 0xc0, 0x38, 0x60, 0xe6, 0x4e, 0xd0, 
  0x02, 0xe6, 0x4f, 0x20, 0x2c, 0xcc, 0xb8, 0x90, 0xf3, 0x20, 0x11, 
  0xcc, 0x29, 0x7f, 0xdd, 0x38, 0x05, 0xd0, 0x3d, 0xa4, 0x26, 0xb9, 
  0x81, 0xc0, 0x4a, 0xb0, 0x35, 0xa0, 0x0a, 0xb9, 0x93, 0xcc, 0x85, 
  0x27, 0x98, 0x48, 0x20, 0xa3, 0xcc, 0x68, 0xa8, 0x88, 0x10, 0xf1, 
  0xa9, 0x01, 0x20, 0x7b, 0xce, 0x20, 0x34, 0xcc, 0x10, 0xfb, 0xc9, 
  0x88, 0xf0, 0xe1, 0x85, 0x27, 0x20, 0xa3, 0xcc, 0x20, 0x1a, 0xcb, 
  0xbd, 0xb8, 0x04, 0x29, 0x07, 0xd0, 0xe8, 0xa9, 0x8d, 0x85, 0x27, 
  0x2c, 0x58, 0xff, 0x38, 0x60, 0xba, 0xc3, 0xd3, 0xd3, 0xa0, 0xc5, 
  0xcc, 0xd0, 0xd0, 0xc1, 0x8d, 0xbd, 0x38, 0x07, 0x10, 0x13, 0xbd, 
  0x38, 0x07, 0x29, 0x02, 0xf0, 0x0d, 0xbd, 0xb8, 0x04, 0x29, 0x38, 
  0xf0, 0x06, 0x8a, 0x48, 0xa9, 0xaf, 0x48, 0x60, 0x20, 0xdf, 0xcc, 
  0x09, 0x80, 0xc9, 0xe0, 0x90, 0x06, 0x59, 0xd3, 0xcc, 0x4c, 0xf6, 
  0xfd, 0xc9, 0xc1, 0x90, 0xf9, 0xc9, 0xdb, 0xb0, 0xf5, 0x59, 0xd7, 
  0xcc, 0x90, 0xf0, 0x20, 0x00, 0xe0, 0x20, 0x00, 0x00, 0x00, 0xc0, 
  0x00, 0x00, 0xe0, 0xc0, 0xbd, 0xb8, 0x03, 0x2a, 0x2a, 0x2a, 0x29, 
  0x03, 0xa8, 0xa5, 0x27, 0x60, 0x42, 0x67, 0xc0, 0x54, 0x47, 0xa6, 
  0x43, 0x87, 0xa6, 0x51, 0x47, 0xb8, 0x52, 0xc7, 0xac, 0x5a, 0xe7, 
  0xf3, 0x49, 0x90, 0xd3, 0x4b, 0x90, 0xdf, 0x45, 0x43, 0x80, 0x46, 
  0xe3, 0x04, 0x4c, 0xe3, 0x01, 0x58, 0xe3, 0x08, 0x54, 0x83, 0x40, 
  0x53, 0x43, 0x40, 0x4d, 0xe3, 0x20, 0x00, 0x42, 0xf6, 0x7c, 0x50, 
  0xf6, 0x9a, 0x44, 0xf6, 0x9b, 0x46, 0xf6, 0x46, 0x4c, 0xf6, 0x40, 
  0x43, 0xf6, 0x3a, 0x54, 0xd6, 0x34, 0x4e, 0x90, 0xe8, 0x53, 0x56, 
  0x60, 0x00, 0xa9, 0x3f, 0xa0, 0x07, 0xd0, 0x10, 0xa9, 0xcf, 0xa0, 
  0x05, 0xd0, 0x0a, 0xa9, 0xf3, 0xa0, 0x03, 0xd0, 0x04, 0xa9, 0xfc, 
  0xa0, 0x01, 0x3d, 0xb8, 0x03, 0x85, 0x2a, 0xbd, 0x38, 0x04, 0x29, 
  0x03, 0x18, 0x6a, 0x2a, 0x88, 0xd0, 0xfc, 0x05, 0x2a, 0x9d, 0xb8, 
  0x03, 0x60, 0x29, 0x07, 0x0a, 0x0a, 0x0a, 0x85, 0x2a, 0x0a, 0xc5, 
  0x26, 0xf0, 0x0f, 0xbd, 0xb8, 0x04, 0x29, 0xc7, 0x05, 0x2a, 0x9d, 
  0xb8, 0x04, 0xa9, 0x00, 0x9d, 0x38, 0x06, 0x60, 0x29, 0x0f, 0xd0, 
  0x07, 0xb9, 0x81, 0xc0, 0x4a, 0x4a, 0x4a, 0x4a, 0x09, 0x10, 0x85, 
  0x2a, 0xa9, 0xe0, 0x85, 0x2b, 0xb9, 0x8b, 0xc0, 0x25, 0x2b, 0x05, 
  0x2a, 0x99, 0x8b, 0xc0, 0x60, 0x88, 0x0a, 0x0a, 0x0a, 0x0a, 0x0a, 
  0x85, 0x2a, 0xa9, 0x1f, 0xd0, 0xe7, 0x1e, 0xb8, 0x04, 0x38, 0xb0, 
  0x10, 0x99, 0x89, 0xc0, 0x20, 0x93, 0xfe, 0x20, 0x89, 0xfe, 0xae, 
  0xf8, 0x07, 0x1e, 0xb8, 0x04, 0x18, 0x7e, 0xb8, 0x04, 0x60, 0xb9, 
  0x8a, 0xc0, 0x48, 0x09, 0x0c, 0x99, 0x8a, 0xc0, 0xa9, 0xe9, 0x20, 
  0xc4, 0xca, 0x68, 0x99, 0x8a, 0xc0, 0x60, 0xa9, 0x28, 0x9d, 0x38, 
  0x06, 0xa9, 0x80, 0x1d, 0x38, 0x07, 0xd0, 0x05, 0xa9, 0xfe, 0x3d, 
  0x38, 0x07, 0x9d, 0x38, 0x07, 0x60, 0xc9, 0x28, 0x90, 0x0e, 0x9d, 
  0x38, 0x06, 0xa9, 0x3f, 0xd0, 0xee, 0x1e, 0x38, 0x05, 0x38, 0x7e, 
  0x38, 0x05, 0x60, 0xa8, 0xa5, 0x27, 0x29, 0x7f, 0xc9, 0x20, 0xd0, 
  0x09, 0xc0, 0x03, 0xf0, 0x01, 0x60, 0xa9, 0x04, 0xd0, 0x6d, 0xc9, 
  0x0d, 0xd0, 0x12, 0x20, 0x79, 0xce, 0xc0, 0x07, 0xf0, 0x01, 0x60, 
  0xa9, 0xcd, 0x48, 0xbd, 0x38, 0x04, 0x48, 0xa4, 0x26, 0x60, 0x85, 
  0x35, 0xa9, 0xce, 0x48, 0xb9, 0x30, 0xce, 0x48, 0xa5, 0x35, 0x60, 
  0xa7, 0x37, 0x61, 0x89, 0x8a, 0xa7, 0x89, 0x89, 0xdd, 0x38, 0x05, 
  0xd0, 0x06, 0xde, 0xb8, 0x04, 0x4c, 0x02, 0xcc, 0xc9, 0x30, 0x90, 
  0x0d, 0xc9, 0x3a, 0xb0, 0x09, 0x29, 0x0f, 0x9d, 0x38, 0x04, 0xa9, 
  0x02, 0xd0, 0x27, 0xc9, 0x20, 0xb0, 0x06, 0x9d, 0x38, 0x05, 0x4c, 
  0x79, 0xce, 0xa0, 0x00, 0xf0, 0x4d, 0x49, 0x30, 0xc9, 0x0a, 0xb0, 
  0x0d, 0xa0, 0x0a, 0x7d, 0x38, 0x04, 0x88, 0xd0, 0xfa, 0x9d, 0x38, 
  0x04, 0xf0, 0x15, 0xa0, 0x2e, 0xd0, 0x36, 0xa9, 0x00, 0x85, 0x2a, 
  0xae, 0xf8, 0x07, 0xbd, 0xb8, 0x04, 0x29, 0xf8, 0x05, 0x2a, 0x9d, 
  0xb8, 0x04, 0x60, 0xa8, 0xbd, 0x38, 0x04, 0xc0, 0x44, 0xf0, 0x09, 
  0xc0, 0x45, 0xd0, 0x11, 0x1d, 0x38, 0x07, 0xd0, 0x05, 0x49, 0xff, 
  0x3d, 0x38, 0x07, 0x9d, 0x38, 0x07, 0xa9, 0x06, 0xd0, 0xd3, 0xa9, 
  0x20, 0x9d, 0xb8, 0x05, 0xd0, 0xf5, 0xb9, 0xeb, 0xcc, 0xf0, 0xf4, 
  0xc5, 0x35, 0xf0, 0x05, 0xc8, 0xc8, 0xc8, 0xd0, 0xf2, 0xc8, 0xb9, 
  0xeb, 0xcc, 0x85, 0x2a, 0x29, 0x20, 0xd0, 0x07, 0xbd, 0x38, 0x07, 
  0x29, 0x10, 0xd0, 0xeb, 0xbd, 0x38, 0x07, 0x4a, 0x4a, 0x24, 0x2a, 
  0xb0, 0x04, 0x10, 0xe0, 0x30, 0x02, 0x50, 0xdc, 0xa5, 0x2a, 0x48, 
  0x29, 0x07, 0x20, 0x7b, 0xce, 0xc8, 0x68, 0x29, 0x10, 0xd0, 0x07, 
  0xb9, 0xeb, 0xcc, 0x9d, 0x38, 0x04, 0x60, 0xa9, 0xcd, 0x48, 0xb9, 
  0xeb, 0xcc, 0x48, 0xa4, 0x26, 0xbd, 0x38, 0x04, 0x60, 0xc2, 0x2c, 
  0x58, 0xff, 0x70, 0x0c, 0x38, 0x90, 0x18, 0xb8, 0x50, 0x06, 0x01, 
  0x31, 0x8e, 0x94, 0x97, 0x9a, 0x85, 0x27, 0x86, 0x35, 0x8a, 0x48, 
  0x98, 0x48, 0x08, 0x78, 0x8d, 0xff, 0xcf, 0x20, 0x58, 0xff, 0xba, 
  0xbd, 0x00, 0x01, 0x8d, 0xf8, 0x07, 0xaa, 0x0a, 0x0a, 0x0a, 0x0a, 
  0x85, 0x26, 0xa8, 0x28, 0x50, 0x29, 0x1e, 0x38, 0x05, 0x5e, 0x38, 
  0x05, 0xb9, 0x8a, 0xc0, 0x29, 0x1f, 0xd0, 0x05, 0xa9, 0xef, 0x20, 
  0x05, 0xc8, 0xe4, 0x37, 0xd0, 0x0b, 0xa9, 0x07, 0xc5, 0x36, 0xf0, 
  0x05, 0x85, 0x36, 0x18, 0x90, 0x08, 0xe4, 0x39, 0xd0, 0xf9, 0xa9, 
  0x05, 0x85, 0x38, 0xbd, 0x38, 0x07, 0x29, 0x02, 0x08, 0x90, 0x03, 
  0x4c, 0xbf, 0xc8, 0xbd, 0xb8, 0x04, 0x48, 0x0a, 0x10, 0x0e, 0xa6, 
  0x35, 0xa5, 0x27, 0x09, 0x20, 0x9d, 0x00, 0x02, 0x85, 0x27, 0xae, 
  0xf8, 0x07, 0x68, 0x29, 0xbf, 0x9d, 0xb8, 0x04, 0x28, 0xf0, 0x06, 
  0x20, 0x63, 0xcb, 0x4c, 0xb5, 0xc8, 0x4c, 0xfc, 0xc8, 0x20, 0x00, 
  0xc8, 0xa2, 0x00, 0x60, 0x4c, 0x9b, 0xc8, 0x4c, 0xaa, 0xc9, 0x4a, 
  0x20, 0x9b, 0xc9, 0xb0, 0x08, 0x20, 0xf5, 0xca, 0xf0, 0x06, 0x18, 
  0x90, 0x03, 0x20, 0xd2, 0xca, 0xbd, 0xb8, 0x05, 0xaa, 0x60, 0xa2, 
  0x03, 0xb5, 0x36, 0x48, 0xca, 0x10, 0xfa, 0xae, 0xf8, 0x07, 0xbd, 
  0x38, 0x06, 0x85, 0x36, 0xbd, 0xb8, 0x04, 0x29, 0x38, 0x4a, 0x4a, 
  0x4a, 0x09, 0xc0, 0x85, 0x37, 0x8a, 0x48, 0xa5, 0x27, 0x48, 0x09, 
  0x80, 0x20, 0xed, 0xfd, 0x68, 0x85, 0x27, 0x68, 0x8d, 0xf8, 0x07, 
  0xaa, 0x0a, 0x0a, 0x0a, 0x0a, 0x85, 0x26, 0x8d, 0xff, 0xcf, 0xa5, 
  0x36, 0x9d, 0x38, 0x06, 0xa2, 0x00, 0x68, 0x95, 0x36, 0xe8, 0xe0, 
  0x04, 0x90, 0xf8, 0xae, 0xf8, 0x07, 0x60, 0xc1, 0xd0, 0xd0, 0xcc, 
  0xc5, 0x08
])

let slot = 1
let acia: SY6551

const interrupt = (onoff: boolean): void => {
  interruptRequest(slot, onoff)
}

const configChange = (config: ConfigChange): void => {
  // do nothing here yet
  console.log("ConfigChange: ", config)
}

export const receiveCommData = (data: Uint8Array) => {
  // data can come in before we are initialized
  if (acia)
    acia.buffer(data)
}

export const resetSerial = () => {
  if (acia)
    acia.reset()
}

export const enableSerialCard = (enable = true, aslot = 1) => {
  if (!enable)
    return

  slot = aslot
  const ext: SY6551Ext = {
    sendData: passTxCommData,
    interrupt: interrupt,
    configChange: configChange
  }
  acia = new SY6551(ext)

  // remap rom to be 256 byte section first, then 2k area
  const driver = new Uint8Array(rom.length + 256)
  // Table 4-4 Address remapping (old serial card manual)
  driver.set(rom.slice(0x700, 0x800))
  driver.set(rom, 0x100)

  setSlotDriver(slot, driver)
  setSlotIOCallback(slot, handleSerialIO)
}

const handleSerialIO = (addr: number, val = -1): number => {

  // We don't manage the ROM
  if (addr >= 0xC100)
    return -1

  const REG = {
      DIPSW1:   0x01,
      DIPSW2:   0x02,
      IOREG:    0x08,
      STATUS:   0x09,
      COMMAND:  0x0A,
      CONTROL:  0x0B,
  }

  switch (addr & 0x0f) {
    case REG.DIPSW1:
        //       off = 1
        // SW:   1   2   3   4      5   6  7
        // Val:  off off off on     off on on
        //       1   1   1   0  0 0 1   0  0
        // Bit:  7   6   5   4  3 2 1   0
        return 0xE2
    case REG.DIPSW2:
        // SW:   1    2     3   4  5  6   7
        // Val:  on   off   off on on off off cts
        //       0  0 1   0 1   0  0  1   1   0 = on
        // Bit:  7  6 5   4 3   2  1          0
        return 0x28
    case REG.IOREG:
        if (val >= 0)
          acia.data = val
        else
          return acia.data
        break

    case REG.STATUS:
        if(val >= 0)
          acia.status = val
        else
          return acia.status
        break

    case REG.COMMAND:
        if(val >= 0)
          acia.command = val  
        else
          return acia.command
        break

    case REG.CONTROL:
        if(val >= 0)
          acia.control = val
        else
          return acia.control
        break

    default:
        console.log("SSC unknown softswitch", (addr&0xf).toString(16))
        break
    }

    return -1
}
