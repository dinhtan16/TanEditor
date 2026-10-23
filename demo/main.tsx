import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TanEditor from '../src';

const START = [
    '<h2 style="text-align:center">PHIẾU KHÁM BỆNH</h2>',
    '<p style="text-align:center"><em>Ngày 23 tháng 10 năm 2026</em></p>',
    '<p>Họ và tên: <span data-tab-leader="dots">&nbsp;Nguyễn Văn An</span> Ngày sinh: <span data-tab-leader="dots">&nbsp;12/05/1990</span></p>',
    '<p>Địa chỉ: <span data-tab-leader="dots">&nbsp;12 Lê Lợi, Quận 1, TP. Hồ Chí Minh</span></p>',
    '<p>Lý do khám: <span data-tab-leader="dots">&nbsp;</span></p>',
    '<p><span data-tab-leader="dots">&nbsp;</span></p>',
    '<table><tbody>',
    '<tr><th><p style="text-align:center">Dịch vụ</p></th><th><p style="text-align:center">Số lượng</p></th><th><p style="text-align:center">Thành tiền</p></th></tr>',
    '<tr><td><p>Cạo vôi răng</p></td><td><p style="text-align:center">1</p></td><td><p style="text-align:right">300.000 đ</p></td></tr>',
    '<tr><td><p>Trám răng thẩm mỹ</p></td><td><p style="text-align:center">2</p></td><td><p style="text-align:right">1.000.000 đ</p></td></tr>',
    '</tbody></table>',
    '<p style="text-align:right"><strong>Tổng cộng: <mark data-color="#fef08a" style="background-color:#fef08a">1.300.000 đ</mark></strong></p>',
    '<table data-borderless="true"><tbody><tr>',
    '<td><p style="text-align:center"><strong>Bệnh nhân</strong></p><p style="text-align:center"><em>(Ký, họ tên)</em></p></td>',
    '<td><p style="text-align:center"><strong>Bác sĩ</strong></p><p style="text-align:center"><em>(Ký, họ tên)</em></p></td>',
    '</tr></tbody></table>',
].join('');

// ?screenshot hides the HTML output below the editor
const SCREENSHOT = new URLSearchParams(location.search).has('screenshot');

function Demo() {
    const [html, setHtml] = useState(START);
    return (
        <div style={{ padding: 16 }}>
            <TanEditor
                value={html}
                onChange={setHtml}
                height={SCREENSHOT ? 760 : 620}
            />
            {!SCREENSHOT && (
                <pre id="html" style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
                    {html}
                </pre>
            )}
        </div>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Demo />
    </StrictMode>
);
