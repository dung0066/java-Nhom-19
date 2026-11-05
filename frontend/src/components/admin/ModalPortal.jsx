import { createPortal } from 'react-dom';

/**
 * Vẽ hộp thoại trực tiếp vào <body>. Hộp thoại position:fixed nằm trong một phần tử cha có transform/animation
 * sẽ bị tính vị trí theo phần tử cha đó và trôi khỏi màn hình, nên các hộp thoại trong tab quản trị luôn dùng portal.
 */
export default function ModalPortal({ children }) {
  return createPortal(children, document.body);
}
