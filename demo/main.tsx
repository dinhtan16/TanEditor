import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TanEditor from '../src';

const START = [
    '<h2 style="text-align:center">PHIẾU MẪU</h2>',
    '<p>Họ và tên: <span data-tab-leader="dots">&nbsp;</span> Ngày sinh: <span data-tab-leader="dots">&nbsp;</span></p>',
    '<p>Địa chỉ: <span data-tab-leader="dots">&nbsp;</span></p>',
    '<table><tbody><tr><th><p>Dịch vụ</p></th><th><p>Số lượng</p></th></tr><tr><td><p>Cạo vôi</p></td><td><p>1</p></td></tr></tbody></table>',
].join('');

function Demo() {
    const [html, setHtml] = useState(START);
    return (
        <div style={{ padding: 16 }}>
            <TanEditor value={html} onChange={setHtml} height={620} />
            <pre id="html" style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
                {html}
            </pre>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Demo />
    </StrictMode>
);
