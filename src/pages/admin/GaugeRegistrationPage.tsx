import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Plus } from 'lucide-react';

interface Gauge {
    id?: number;
    name: string;
    isStandardNo: string;
    nonNablCertFormatNo: string;
    nablCertFormatNo: string;
    rawDatasheetFormatNo: string;
    certificateCode: string;
    calibrationMethod: string;
    gaugeType: string;
    environmentalConditions: string;
}

export default function GaugeRegistrationPage() {
    const [gauges, setGauges] = useState<Gauge[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [gaugeName, setGaugeName] = useState("");
    const [isStandardNo, setIsStandardNo] = useState("");
    const [nonNablCertFormatNo, setNonNablCertFormatNo] = useState("");
    const [nablCertFormatNo, setNablCertFormatNo] = useState("");
    const [rawDatasheetFormatNo, setRawDatasheetFormatNo] = useState("");
    const [certificateCode, setCertificateCode] = useState("");
    const [calibrationMethod, setCalibrationMethod] = useState("Method A");
    const [gaugeType, setGaugeType] = useState("Mechanical");
    const [environmentalConditions, setEnvironmentalConditions] = useState("20 °C ± 2 °C");

    const fetchGauges = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/gauges');
            if (res.ok) {
                const data = await res.json();
                setGauges(data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => {
        fetchGauges();
    }, []);

    const resetForm = () => {
        setGaugeName("");
        setIsStandardNo("");
        setNonNablCertFormatNo("");
        setNablCertFormatNo("");
        setRawDatasheetFormatNo("");
        setCertificateCode("");
        setCalibrationMethod("Method A");
        setGaugeType("Mechanical");
        setEnvironmentalConditions("20 °C ± 2 °C");
    };

    const handleSave = async () => {
        if (!gaugeName.trim()) return;

        try {
            const payload = {
                gaugeName, isStandardNo, nonNablCertFormatNo, nablCertFormatNo,
                rawDatasheetFormatNo, certificateCode, calibrationMethod, gaugeType,
                environmentalConditions
            };

            const res = await fetch('http://localhost:3001/api/gauges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchGauges();
                resetForm();
            } else {
                console.error("Failed to save gauge to db");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredGauges = gauges.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.certificateCode && g.certificateCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
            <div className="bg-white border border-gray-300 shadow-sm">
                <div className="bg-gray-50 border-b border-gray-300 p-4 px-6 flex justify-between items-center">
                    <h2 className="text-lg font-bold uppercase tracking-wide text-gray-800">Gauge Info Registration</h2>
                    <div className="flex gap-2">
                        <button onClick={resetForm} className="bg-white border border-gray-300 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors">Clear</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Plus size={14} /> Save Gauge
                        </button>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-1 lg:col-span-3">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Gauge Name <span className="text-red-500">*</span></label>
                        <input value={gaugeName} onChange={e => setGaugeName(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange bg-gray-50 uppercase" placeholder="E.g., VERNIER CALIPER 0-150MM" />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">IS Standard No.</label>
                        <input value={isStandardNo} onChange={e => setIsStandardNo(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange" placeholder="IS 3651:2009" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Gauge Type</label>
                        <select value={gaugeType} onChange={e => setGaugeType(e.target.value)} className="border border-gray-300 p-2 text-sm focus:outline-brand-orange bg-white">
                            <option>Mechanical</option>
                            <option>Electrical</option>
                            <option>Thermal</option>
                            <option>Optical</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Calibration Method</label>
                        <input value={calibrationMethod} onChange={e => setCalibrationMethod(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange" />
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Non-NABL Format No.</label>
                        <input value={nonNablCertFormatNo} onChange={e => setNonNablCertFormatNo(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">NABL Format No.</label>
                        <input value={nablCertFormatNo} onChange={e => setNablCertFormatNo(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Raw Datasheet Format No.</label>
                        <input value={rawDatasheetFormatNo} onChange={e => setRawDatasheetFormatNo(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange" />
                    </div>

                    {/* Row 4 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Certificate Code</label>
                        <input value={certificateCode} onChange={e => setCertificateCode(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange" placeholder="VMC-CC-" />
                    </div>
                    <div className="flex flex-col gap-1 lg:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Environmental Conditions</label>
                        <input value={environmentalConditions} onChange={e => setEnvironmentalConditions(e.target.value)} type="text" className="border border-gray-300 p-2 text-sm focus:outline-brand-orange" placeholder="20 °C ± 2 °C" />
                    </div>
                </div>
            </div>

            {/* Gauges List DataGrid */}
            <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
                <div className="bg-gray-50 border-b border-gray-300 p-4 px-6 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Registered Gauges</h3>
                    <div className="flex items-center bg-white border border-gray-300 px-2 py-1 w-64 focus-within:border-brand-orange transition-colors">
                        <Search className="w-3 h-3 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search gauges..."
                            className="text-xs w-full focus:outline-none font-mono"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-mono text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="p-3 border-r border-gray-300 w-16 text-center">ID</th>
                                <th className="p-3 border-r border-gray-300">Gauge Name</th>
                                <th className="p-3 border-r border-gray-300">Type</th>
                                <th className="p-3 border-r border-gray-300">Standard No.</th>
                                <th className="p-3 border-r border-gray-300">Certificate Code</th>
                                <th className="p-3">Calibration Method</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredGauges.length > 0 ? (
                                filteredGauges.map((g, i) => (
                                    <tr key={g.id || i} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <td className="p-3 border-r border-gray-300 text-center font-mono text-xs text-gray-400">{g.id}</td>
                                        <td className="p-3 border-r border-gray-300 font-bold text-blue-600 group-hover:text-brand-orange transition-colors">{g.name}</td>
                                        <td className="p-3 border-r border-gray-300 text-gray-600 text-xs uppercase">{g.type}</td>
                                        <td className="p-3 border-r border-gray-300 text-gray-600 text-xs">{g.isStandardNo || '-'}</td>
                                        <td className="p-3 border-r border-gray-300 text-gray-600 font-mono text-xs">{g.certificateCode || '-'}</td>
                                        <td className="p-3 text-gray-600 text-xs">{g.calibrationMethod || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400 font-mono text-xs">
                                        NO_GAUGES_FOUND // AWAITING_INPUT
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
