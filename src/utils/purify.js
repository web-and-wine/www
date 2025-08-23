import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

let window = new JSDOM('').window;
let purify_ = DOMPurify(window);

export default function purify(raw, options) {
	return purify_.sanitize(raw, options);
}
