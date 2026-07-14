import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer, FileDown } from "lucide-react"
import html2pdf from "html2pdf.js"

type GoodsLineItem = {
    id: string
    qrCodeNumber?: string
    description: string
    pctCode: string
    quantity: string
    unit: string
    condition: string
    assessableValuePkr: string
    identificationRef: string
    itemNotes: string
    perishable?: boolean
}

type DetentionMemoRow = {
    [key: string]: unknown
    id: string
    caseNo: string
    firNumber?: string
    referenceNumber: string
    dateTimeOccurrence: string
    placeOfOccurrence: string
    dateTimeDetention: string
    placeOfDetention: string
    detentionType: string
    directorate: string
    reasonForDetention: string
    whereDeposited: string
    settlementStatus: string
    verificationStatus: string
    briefFacts?: string
    forwardingOfficerRemarks?: string
    accusedName?: string
    accusedCnic?: string
    accusedAddress?: string
    goodsItems?: GoodsLineItem[]
    seizingOfficerNotes?: string
    examiningOfficerNotes?: string
    detentionNotes?: string
    createdAt: string
    updatedAt?: string
    createdBy?: string
    memoQrCodeNumber?: string
    memoQrCodePayload?: string
}

interface DetentionMemoReportProps {
    row: DetentionMemoRow
    qrPayload: string
    qrNumber: string
}

function getQrCodeUrl(data: string, size = 180) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`
}

function getGoodsQrPayload(memoId: string, item: GoodsLineItem): string {
    const ref = item.qrCodeNumber || `${memoId}-${item.id}`
    return `${window.location.origin}/detention-memo/${encodeURIComponent(memoId)}?goodsQr=${encodeURIComponent(ref)}`
}

function formatDate(value?: string): string {
    if (!value) return "—"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString()
}

export default function DetentionMemoReport({ row, qrPayload, qrNumber }: DetentionMemoReportProps) {
    const reportRef = useRef<HTMLDivElement>(null)
    const goodsItems = row.goodsItems ?? []
    const hasGoods = goodsItems.length > 0
    const showPctCode = goodsItems.some((item) => Boolean(item.pctCode?.trim()))
    const showPerishable = goodsItems.some((item) => Boolean(item.perishable))
    const showIdentificationRef = goodsItems.some((item) => Boolean(item.identificationRef?.trim()))
    const showNotes = goodsItems.some((item) => Boolean(item.itemNotes?.trim()))
    const prefersLandscapePdf = goodsItems.length > 5 || showPctCode || showIdentificationRef || showNotes

    const handlePrint = () => {
        window.print()
    }

    const handleSaveAsPDF = () => {
        if (!reportRef.current) return

        const element = reportRef.current
        const opt = {
            margin: 10,
            filename: `Detention-Memo-${row.caseNo}-${new Date().getTime()}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: prefersLandscapePdf ? "landscape" : "portrait", unit: "mm", format: "a4" },
        }

        html2pdf().set(opt).from(element).save()
    }

    return (
        <div className="fixed inset-0 overflow-auto bg-white z-50 w-screen h-screen">
            <style>{`
        :root {
          color-scheme: light;
        }
        body, html {
          background: #f3f4f6;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }
        .report-sheet {
          max-width: 1200px;
          margin: 1.5rem auto;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 8px 24px rgba(17, 24, 39, 0.08);
        }
        .header-section {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 140px;
          gap: 1rem;
          align-items: start;
          border-bottom: 2px solid #111827;
          padding-bottom: 0.875rem;
        }
        .header-title {
          font-size: 1.375rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .header-subtitle {
          margin-top: 0.3rem;
          font-size: 0.875rem;
          color: #4b5563;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        .box {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.75rem;
          background: #fff;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem 1.25rem;
        }
        .info-row {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          gap: 0.4rem;
          font-size: 0.92rem;
          line-height: 1.35;
        }
        .info-label {
          font-weight: 600;
          color: #374151;
        }
        .report-section {
          margin-top: 1rem;
          page-break-inside: avoid;
        }
        .goods-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 0.86rem;
        }
        .goods-table th,
        .goods-table td {
          border: 1px solid #d1d5db;
          padding: 0.4rem;
          text-align: left;
          vertical-align: top;
          overflow-wrap: anywhere;
        }
        .goods-table th {
          background: #f3f4f6;
          font-weight: 700;
        }
        .goods-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        .footer {
          margin-top: 1rem;
          border-top: 1px solid #d1d5db;
          padding-top: 0.5rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          font-size: 0.75rem;
          color: #4b5563;
        }
        .qr-container {
          text-align: center;
        }
        .qr-container img {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 4px;
          background: #fff;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          body, html {
            background: white !important;
            color: #111827 !important;
          }
          .report-sheet {
            max-width: none;
            margin: 0;
            border: 0;
            border-radius: 0;
            box-shadow: none;
            padding: 0;
          }
          .report-container {
            width: 100%;
            background: #fff;
            color: #111827;
            padding: 0;
            margin: 0;
          }
          .report-section {
            page-break-inside: avoid;
          }
          .info-grid,
          .header-section {
            page-break-inside: avoid;
          }
          .info-row {
            font-size: 10.5pt;
          }
          .goods-table {
            font-size: 9.8pt;
          }
          .goods-table th,
          .goods-table td {
            padding: 5px 4px;
          }
          .footer {
            font-size: 9pt;
          }
        }
        @media (max-width: 900px) {
          .header-section {
            grid-template-columns: 1fr;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .info-row {
            grid-template-columns: 140px minmax(0, 1fr);
          }
        }
      `}</style>

            <div className="no-print sticky top-0 z-50 flex gap-2 bg-white border-b shadow-sm p-4">
                <Button onClick={handlePrint} variant="default" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Report
                </Button>
                <Button onClick={handleSaveAsPDF} variant="secondary" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Save as PDF
                </Button>
            </div>

            <div ref={reportRef} className="report-container">
                <div className="report-sheet">
                {/* Header Section */}
                <div className="header-section">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Pakistan Customs Authority</div>
                        <div className="header-title mt-1">Detention Memo Report</div>
                        <div className="header-subtitle">Official customs document for goods detention and inventory</div>
                    </div>
                    <div className="qr-container">
                        <img
                            src={getQrCodeUrl(qrPayload, 100)}
                            alt="Memo QR Code"
                            className="qr-img border border-gray-400"
                        />
                        <div className="text-[10px] mt-2 font-mono text-gray-700">{qrNumber}</div>
                    </div>
                </div>

                {/* Key Information Section */}
                <div className="report-section box">
                    <div className="info-grid">
                        <div className="info-row">
                            <span className="info-label">Memo Number:</span> {row.caseNo}
                        </div>
                        <div className="info-row">
                            <span className="info-label">Reference Number:</span> {row.referenceNumber || "—"}
                        </div>
                        <div className="info-row">
                            <span className="info-label">FIR Number:</span> {row.firNumber || "—"}
                        </div>
                        <div className="info-row">
                            <span className="info-label">Detention Type:</span> {row.detentionType || "—"}
                        </div>
                        <div className="info-row">
                            <span className="info-label">Created By:</span> {row.createdBy || "ASO Portal"}
                        </div>
                        <div className="info-row">
                            <span className="info-label">Created Date:</span> {row.createdAt || "—"}
                        </div>
                        <div className="info-row">
                            <span className="info-label">Updated Date:</span> {formatDate(row.updatedAt || row.createdAt)}
                        </div>
                        <div className="info-row">
                            <span className="info-label">Verification Status:</span> {row.verificationStatus || "—"}
                        </div>
                    </div>
                </div>

                {/* Basic Information Section */}
                <div className="report-section">
                    <div className="section-title">Basic Information</div>
                    <div className="box">
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="info-label">Date/Time of Occurrence:</span> {row.dateTimeOccurrence || "—"}
                            </div>
                            <div className="info-row">
                                <span className="info-label">Place of Occurrence:</span> {row.placeOfOccurrence || "—"}
                            </div>
                            <div className="info-row">
                                <span className="info-label">Date/Time of Detention:</span> {row.dateTimeDetention || "—"}
                            </div>
                            <div className="info-row">
                                <span className="info-label">Place of Detention:</span> {row.placeOfDetention || "—"}
                            </div>
                            <div className="info-row">
                                <span className="info-label">Directorate:</span> {row.directorate || "—"}
                            </div>
                            <div className="info-row">
                                <span className="info-label">Where Deposited:</span> {row.whereDeposited || "—"}
                            </div>
                            <div className="info-row">
                                <span className="info-label">Settlement Status:</span> {row.settlementStatus || "—"}
                            </div>
                            <div className="info-row">
                                <span className="info-label">Reason for Detention:</span> {row.reasonForDetention || "—"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brief Facts Section */}
                {row.briefFacts && (
                    <div className="report-section">
                        <div className="section-title">Memo Description</div>
                        <div className="box">
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{row.briefFacts}</div>
                        </div>
                    </div>
                )}

                {/* Goods Information Section */}
                {hasGoods && (
                    <div className="report-section">
                        <div className="section-title">Goods Information</div>
                        <table className="goods-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "86px" }}>QR Code</th>
                                    <th>Description</th>
                                    <th style={{ width: "66px" }}>Quantity</th>
                                    <th style={{ width: "58px" }}>Unit</th>
                                    <th style={{ width: "96px" }}>Condition</th>
                                    <th style={{ width: "104px" }}>Assessable (PKR)</th>
                                    {showPctCode && <th style={{ width: "84px" }}>PCT Code</th>}
                                    {showPerishable && <th style={{ width: "70px" }}>Perishable</th>}
                                    {showIdentificationRef && <th style={{ width: "110px" }}>ID/Chassis Ref</th>}
                                    {showNotes && <th>Notes</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {goodsItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <img
                                                src={getQrCodeUrl(getGoodsQrPayload(row.id, item), 64)}
                                                alt={`Goods QR ${item.qrCodeNumber || item.id}`}
                                                className="h-12 w-12 border rounded p-1 bg-white"
                                            />
                                            {item.qrCodeNumber && <div className="text-[8pt] mt-1 break-all">{item.qrCodeNumber}</div>}
                                        </td>
                                        <td>{item.description || "—"}</td>
                                        <td>{item.quantity || "—"}</td>
                                        <td>{item.unit || "—"}</td>
                                        <td>{item.condition || "—"}</td>
                                        <td>{item.assessableValuePkr || "—"}</td>
                                        {showPctCode && <td>{item.pctCode || "—"}</td>}
                                        {showPerishable && <td>{item.perishable ? "Yes" : "No"}</td>}
                                        {showIdentificationRef && <td>{item.identificationRef || "—"}</td>}
                                        {showNotes && <td>{item.itemNotes || "—"}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Additional Notes Section */}
                {(row.seizingOfficerNotes || row.examiningOfficerNotes || row.detentionNotes || row.forwardingOfficerRemarks) && (
                    <div className="report-section">
                        <div className="section-title">Additional Notes & Remarks</div>
                        <div className="space-y-3">
                            {row.seizingOfficerNotes && (
                                <div className="box">
                                    <div className="text-[9pt] font-bold text-gray-700 mb-1">Seizing Officer Notes:</div>
                                    <div className="text-[9pt] whitespace-pre-wrap">{row.seizingOfficerNotes}</div>
                                </div>
                            )}
                            {row.examiningOfficerNotes && (
                                <div className="box">
                                    <div className="text-[9pt] font-bold text-gray-700 mb-1">Examining Officer Notes:</div>
                                    <div className="text-[9pt] whitespace-pre-wrap">{row.examiningOfficerNotes}</div>
                                </div>
                            )}
                            {row.detentionNotes && (
                                <div className="box">
                                    <div className="text-[9pt] font-bold text-gray-700 mb-1">Detention / Customs Notes:</div>
                                    <div className="text-[9pt] whitespace-pre-wrap">{row.detentionNotes}</div>
                                </div>
                            )}
                            {row.forwardingOfficerRemarks && (
                                <div className="box">
                                    <div className="text-[9pt] font-bold text-gray-700 mb-1">Forwarding Officer Remarks:</div>
                                    <div className="text-[9pt] whitespace-pre-wrap">{row.forwardingOfficerRemarks}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Section */}
                <div className="footer">
                    <span>Generated: {new Date().toLocaleString()}</span>
                    <span>Detention Memo System • Pakistan Customs</span>
                </div>
                </div>
            </div>
        </div>
    )
}
