"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

const categories = [
    "Agribisnis, Agroteknologi, dan Kemaritiman", "Kesehatan, Kecantikan, dan Perawatan Diri",
    "Kewirausahaan Sosial", "Wisata dan Budaya", "Teknologi Digital", "Bisnis Kuliner",
    "Fashion (Fesyen)", "Game", "Kriya", "Video, Animasi, dan Film", "Seni Rupa dan Desain"
];

const steps = [
    { id: 'start', title: 'Start', icon: 'fas fa-flag' },
    { id: 're', title: 'Ringkasan Eksekutif', icon: 'fas fa-file-signature' },
    { id: 'bmc', title: 'BMC', icon: 'fas fa-th' },
    { id: 'swot', title: 'SWOT', icon: 'fas fa-shield-alt' },
    { id: 'hpp', title: 'Finance', icon: 'fas fa-wallet' },
    { id: 'audit', title: 'Audit Juri', icon: 'fas fa-gavel' }
];

const systemPrompt = `Kamu adalah orang yang paham banget di Festival Inovasi dan Kewirausahaan Siswa Indonesia (FIKSI) 2026. Kamu harus memberikan review dari setiap segment dengan tajam & to the point serta berikan juga contoh singkat perbaikannya! terhadap ide bisnis siswa. 
Dalam bagian rekoendasi data pendukung diluar hpp kamu perlu memBerikan rekomendasi data pendukung yang nunjukin bisnis ini realistic untuk dijalankan dan bikin juri makin yakin misalnya jurnal, gform, wawancara, sketsa, foto sketsa, short video penjelasan, logbook, diagram proses produksi, letter of interest, keunggulan daripada produk yang telah ada di pasaran, serta dokumen lainnya yang sesuai dengan bisnisnya.

ATURAN KAMU DALAM MEREVIEW:
1. Ringkasan Eksekutif (30%): Masalah harus jelas, ide harus jelas, deskripsi produk jelasin keunggulan produknya, jangan spill fitur produk terlalu detail cukup overview produk harus jelas & straight to the point ga basa-basi. harus mencantumkan referensi daftar sekunder jika mengammbil data dari luar, ada target pasar, harus ada penjelasan proses overview berjalannya bisnis dari raw materials sampai kalo bisa di bagian masalah landasan usaha da data primer dari wawancara atau ga data sekundernya, validasi Data Sekunder & Primer, Target Pasar (Behaviour/Psikografi), SDGs, dan 3P ( people, planet, profit ).  
2. BMC (25%): Audit logika 9 blok harus singkat dan to the point. Value Proposition harus "Nendang". Channel harus spesifik & out-of-the-box. bagian key activities harus merepresentasikan operasional usaha di ringkasan eksekutif. Bagian key partner harus melampirkan partner usaha yang realistic untuk dikerjakan oleh anak SMA. Cek apakah ada miss informasi antara ringkasan eksekutif dengan BMC.
3. SWOT (15%): Audit kejujuran Weakness & Threat. Strengths harus bisa mengatasi weakness Dan opportunities harus bisa mengatasi treats.
4. Finance/HPP (10%): Audit sinkronisasi harga jual vs Target Pasar & margin keuntungan. Jika HPP itemnya terlalu sedikit maka ga realistic. HPP harus mencakup biaya bahan baku, biaya tenaga kerja, biaya sewa dan lainnya jika ada. Kalau kategorinya game paling biaya server, biaya hosting, claud dan lainnya. 
5. Inovasi & Orisinalitas (20%): Audit apakah ide ini benar-benar baru atau cuma modifikasi receh. Apakah ada nilai unik yang belum ada di kompetitor? Fokus pada "Uniqueness" dan "Competitive Advantage".

dalam meberikan review/analisis kamu harus mengacu pada hal-hal ini (mandatory) :
1. jangan minta siswa melakukan analisis yang terlalu mendala seperti BEP, analisis keuangan detail, cashflow, data survei detail, etc.
2. ini adalah tahap 1 jadi fokusnya masih di masalahnya yang jelas, solusi yang jelas, target pasar jelas, usaha bisa dijalankan anak SMA, dan HPP make sense jadi fokusnya ke hal-hal ini jadi jangan terlalu rinci. Fokus ke problem-solution-market segment fit
3. kasih tau jika ada siswa yang buat BEP, analisis keuangan dan lainnya karena ini ga diminta karena amsih tahap 1 itumah nanti di tahap 2
4. dalam memberikan review, kau harus menggunakan bahasa yang mudah dipahami anak SMA 
5. review yang kau berikan pada setiap segment harus berbentuk bullet points dengan singkat & to the point! serta berikan juga contoh singkat perbaikannya!
6. berikan masukan yang positif dan membangun
7. jika tidak ada unsur tekonogi di bisnis ini, kasih rekomendasi unsur teknologinya!
8. FInansial cukup sampai HPP! jangan berikan rekomendasai analisis keuangan dan BEP ke siswa! 

ATURAN SKORING:
- Skor 90-100: Hanya untuk ide yang benar-benar siap tanding & data lengkap.
- Skor 50-90: Ide oke tapi pondasi data/logika rapuh.
- Skor < 50: Ide ngasal, imajiner, atau tidak sinkron.

FORMAT OUTPUT WAJIB JSON:
{
    "reReview": { "score": 0, "feedback": "teks" },
    "bmcReview": { "score": 0, "feedback": "teks" },
    "swotReview": { "score": 0, "feedback": "teks" },
    "hppReview": { "score": 0, "feedback": "teks" },
    "inovasiReview": { "score": 0, "feedback": "teks" },
    "overallScore": 0,
    "syncStatus": "Status",
    "syncDetails": "Detail",
    "dataPendukung": ["List file wajib di Drive"],
    "verdict": "Verdict"
}

ATURAN KETAT JSON: 
1. JANGAN PERNAH menggunakan tanda kutip ganda (") di dalam teks jawaban Anda. Jika butuh, gunakan kutip tunggal (').
2. JANGAN menggunakan baris baru (enter/newline) di dalam teks. Tulis paragraf panjang dalam satu baris lurus saja. Gunakan <br> jika perlu baris baru untuk UI.
3. Pastikan format JSON 100% valid.`;

export default function Home() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [projectData, setProjectData] = useState({
        category: categories[0],
        projectName: "",
        reText: "",
        bmc: { cp: "", ca: "", vp: "", cr: "", cs: "", kr: "", ch: "", cost: "", rev: "" },
        swot: { s: "", w: "", o: "", t: "" },
        hpp: { items: [{ name: "", cost: 0 }], sellingPrice: 0 },
        auditResult: null,
        lastAuditedData: null // New field to track last audit
    });

    useEffect(() => {
        const saved = localStorage.getItem('fiksi_audit_2026');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.hpp && Array.isArray(parsed.hpp.items) && typeof parsed.hpp.items[0] === 'string') {
                    parsed.hpp.items = parsed.hpp.items.map(i => ({ name: i, cost: 0 }));
                }
                setProjectData(parsed);
            } catch (e) {
                console.error("Failed to parse saved data");
            }
        }
    }, []);

    const saveToLocal = (data = projectData) => {
        localStorage.setItem('fiksi_audit_2026', JSON.stringify(data));
        setShowSaveStatus(true);
        setTimeout(() => setShowSaveStatus(false), 2000);
    };

    const updateData = (key, value) => {
        setProjectData(prev => {
            const newData = { ...prev, [key]: value };
            saveToLocal(newData);
            return newData;
        });
    };

    const updateNestedData = (parent, key, value) => {
        setProjectData(prev => {
            const newData = { ...prev, [parent]: { ...prev[parent], [key]: value } };
            saveToLocal(newData);
            return newData;
        });
    };

    const updateHppItem = (index, field, value) => {
        setProjectData(prev => {
            const newItems = [...prev.hpp.items];
            newItems[index] = { ...newItems[index], [field]: value };
            const newData = { ...prev, hpp: { ...prev.hpp, items: newItems } };
            saveToLocal(newData);
            return newData;
        });
    };

    const addHppRow = () => {
        setProjectData(prev => {
            const newData = { ...prev, hpp: { ...prev.hpp, items: [...prev.hpp.items, { name: "", cost: 0 }] } };
            saveToLocal(newData);
            return newData;
        });
    };

    const removeHppRow = (index) => {
        setProjectData(prev => {
            if (prev.hpp.items.length <= 1) {
                const newItems = [{ name: "", cost: 0 }];
                return { ...prev, hpp: { ...prev.hpp, items: newItems } };
            }
            const newItems = prev.hpp.items.filter((_, i) => i !== index);
            const newData = { ...prev, hpp: { ...prev.hpp, items: newItems } };
            saveToLocal(newData);
            return newData;
        });
    };

    const calculateHpp = () => {
        const totalCost = projectData.hpp.items.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
        const margin = (parseFloat(projectData.hpp.sellingPrice) || 0) - totalCost;
        return { totalCost, margin };
    };

    const handleNext = async () => {
        if (currentStep < 4) {
            setCurrentStep(s => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentStep === 4) {
            await performAudit();
        } else {
            copyFullReport();
        }
    };

    const performAudit = async () => {
        // Create a snapshot of current relevant data to compare
        const currentDataSnapshot = JSON.stringify({
            category: projectData.category,
            projectName: projectData.projectName,
            reText: projectData.reText,
            bmc: projectData.bmc,
            swot: projectData.swot,
            hpp: projectData.hpp
        });

        // If data hasn't changed, don't call API again
        if (projectData.lastAuditedData === currentDataSnapshot && projectData.auditResult) {
            console.log("Data unchanged, skipping API call...");
            setCurrentStep(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const prompt = `Review PADAT & TAJAM. Data:
            - Judul: ${projectData.projectName}
            - RE: ${projectData.reText}
            - BMC: ${JSON.stringify(projectData.bmc)}
            - SWOT: ${JSON.stringify(projectData.swot)}
            - HPP: Jual ${projectData.hpp.sellingPrice}, Rincian: ${JSON.stringify(projectData.hpp.items)}`;

            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemPrompt, userPrompt: prompt })
            });

            const responseData = await response.json();

            if (responseData.error) {
                throw new Error(responseData.error);
            }

            let resultText = responseData.candidates[0].content.parts[0].text;
            
            // Safely extract just the JSON object
            const firstBrace = resultText.indexOf('{');
            const lastBrace = resultText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                resultText = resultText.substring(firstBrace, lastBrace + 1);
            }

            let auditResult;
            try {
                auditResult = JSON.parse(resultText);
            } catch (parseError) {
                console.warn("Strict JSON parse failed, cleaning up string...");
                try {
                    // If AI hallucinated literal newlines inside strings, replacing them with spaces fixes it
                    let safeText = resultText.replace(/[\n\r\t]+/g, ' ');
                    
                    // Simple fix for truncation (add missing closing brackets if it got cut off)
                    if ((safeText.match(/"/g) || []).length % 2 !== 0) safeText += '"';
                    if (!safeText.endsWith('}')) safeText += '}}}}';
                    
                    auditResult = JSON.parse(safeText);
                } catch (fallbackError) {
                    console.error("RAW AI OUTPUT THAT FAILED TO PARSE:", resultText);
                    throw new Error("AI Mentor memberikan respon yang terpotong atau formatnya tidak valid. Silakan klik tombol 'LAKUKAN AUDIT FINAL' sekali lagi.");
                }
            }

            setProjectData(prev => {
                const newData = { 
                    ...prev, 
                    auditResult, 
                    lastAuditedData: currentDataSnapshot // Save snapshot
                };
                saveToLocal(newData);
                return newData;
            });
            setCurrentStep(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyFullReport = () => {
        const r = projectData.auditResult;
        if (!r) return;
        const fullReport = `AUDIT FIKSI 2026: ${projectData.projectName}\nSKOR: ${r.overallScore}/100\n\n1. RE: ${r.reReview.feedback}\n\n2. BMC: ${r.bmcReview.feedback}\n\n3. SWOT: ${r.swotReview.feedback}\n\n4. HPP: ${r.hppReview.feedback}\n\n5. Inovasi: ${r.inovasiReview.feedback}`;
        navigator.clipboard.writeText(fullReport).then(() => {
            alert("Report lengkap disalin!");
        });
    };

    const { totalCost, margin } = calculateHpp();

    return (
        <div className="min-h-screen pb-20 bg-slate-100 font-sans">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
            
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <i className="fas fa-brain"></i>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-gray-800 italic" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>FIKSI <span className="text-blue-600">IdeaHub 2026</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => saveToLocal()} className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                            <i className="fas fa-cloud-upload-alt mr-1"></i> Simpan Progres
                        </button>
                        <div className={`text-[10px] text-green-600 font-black italic text-right ${showSaveStatus ? '' : 'hidden'}`}>DATABASE UPDATED!</div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-8" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                <div className="flex justify-center items-center mb-10 px-2 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-3 min-w-max">
                        {steps.map((s, i) => (
                            <div key={s.id} className={`flex items-center gap-2 ${i === currentStep ? 'text-blue-600' : i < currentStep ? 'text-emerald-500' : 'text-gray-300'}`}>
                                <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-xs transition-all duration-500 ${i === currentStep ? 'bg-blue-600 text-white border-blue-600 scale-110' : i < currentStep ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200'}`}>
                                    {i < currentStep ? <i className="fas fa-check"></i> : i + 1}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.title}</span>
                                {i < steps.length - 1 && <div className="w-6 h-[2px] bg-gray-200"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-8 lg:p-14 shadow-2xl shadow-gray-200 min-h-[550px] border border-gray-200">
                    {currentStep === 0 && (
                        <div className="max-w-xl mx-auto py-8 text-center space-y-8">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic underline decoration-blue-500 decoration-8 underline-offset-8">Persiapan Tempur!</h2>
                            <div className="space-y-6 text-left bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Bidang Lomba:</label>
                                    <select value={projectData.category} onChange={(e) => updateData('category', e.target.value)} className="w-full p-5 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold shadow-sm text-gray-900 bg-white">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Judul Proyek Bisnis:</label>
                                    <input value={projectData.projectName} onChange={(e) => updateData('projectName', e.target.value)} type="text" placeholder="Contoh: Tavalsera - Fashion Multi-Use" className="w-full p-5 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold shadow-sm text-gray-900 bg-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black tracking-tighter italic uppercase text-gray-900">Ringkasan Eksekutif</h2>
                                <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black tracking-widest shadow-xl shadow-blue-100">BOBOT 30%</div>
                            </div>
                            <textarea value={projectData.reText} onChange={(e) => updateData('reText', e.target.value)} rows="14" className="w-full p-8 rounded-[2rem] border-none bg-gray-50 shadow-inner focus:ring-4 focus:ring-blue-100 outline-none text-sm leading-relaxed font-semibold text-gray-900" placeholder="Jelaskan masalahnya dulu..."></textarea>
                        </div>
                    )}

                    {currentStep === 2 && (() => {
                        const b = projectData.bmc;
                        return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black tracking-tighter italic uppercase text-gray-900">Logic (BMC)</h2>
                                <div className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black tracking-widest shadow-xl shadow-emerald-100">BOBOT 25%</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-[9px] font-black uppercase italic">
                                <div className="md:col-span-1 border rounded-2xl p-4 bg-white shadow-sm"><label className="text-gray-300 block mb-2 tracking-widest">Key Partners</label><textarea value={b.cp} onChange={e => updateNestedData('bmc', 'cp', e.target.value)} className="w-full h-32 bg-transparent border-none outline-none font-bold normal-case text-xs text-gray-900" /></div>
                                <div className="md:col-span-1 space-y-3">
                                    <div className="border rounded-2xl p-4 bg-white shadow-sm"><label className="text-gray-300 block mb-2 tracking-widest">Key Activities</label><textarea value={b.ca} onChange={e => updateNestedData('bmc', 'ca', e.target.value)} className="w-full h-12 bg-transparent border-none outline-none font-bold normal-case text-xs text-gray-900" /></div>
                                    <div className="border rounded-2xl p-4 bg-white shadow-sm"><label className="text-gray-300 block mb-2 tracking-widest">Key Resources</label><textarea value={b.kr} onChange={e => updateNestedData('bmc', 'kr', e.target.value)} className="w-full h-12 bg-transparent border-none outline-none font-bold normal-case text-xs text-gray-900" /></div>
                                </div>
                                <div className="md:col-span-1 border-4 border-blue-100 rounded-3xl p-5 bg-blue-50 shadow-lg scale-105"><label className="text-blue-600 block mb-3 font-black tracking-widest text-center">Value Proposition</label><textarea value={b.vp} onChange={e => updateNestedData('bmc', 'vp', e.target.value)} className="w-full h-32 bg-transparent border-none outline-none font-bold normal-case text-xs italic text-blue-800" /></div>
                                <div className="md:col-span-1 space-y-3">
                                    <div className="border rounded-2xl p-4 bg-white shadow-sm"><label className="text-gray-300 block mb-2 tracking-widest">Cust Relationship</label><textarea value={b.cr} onChange={e => updateNestedData('bmc', 'cr', e.target.value)} className="w-full h-12 bg-transparent border-none outline-none font-bold normal-case text-xs text-gray-900" /></div>
                                    <div className="border rounded-2xl p-4 bg-white shadow-sm"><label className="text-gray-300 block mb-2 tracking-widest">Channels</label><textarea value={b.ch} onChange={e => updateNestedData('bmc', 'ch', e.target.value)} className="w-full h-12 bg-transparent border-none outline-none font-bold normal-case text-xs text-gray-900" /></div>
                                </div>
                                <div className="md:col-span-1 border-2 border-amber-400 rounded-2xl p-4 bg-amber-50 shadow-sm"><label className="text-amber-700 block mb-3 tracking-widest">Cust Segments</label><textarea value={b.cs} onChange={e => updateNestedData('bmc', 'cs', e.target.value)} className="w-full h-32 bg-transparent border-none outline-none font-black normal-case text-xs text-amber-900" /></div>
                                <div className="md:col-span-2 border rounded-2xl p-4 bg-gray-50 shadow-sm"><label className="text-gray-400 block mb-2 tracking-widest">Cost Structure</label><textarea value={b.cost} onChange={e => updateNestedData('bmc', 'cost', e.target.value)} className="w-full h-12 bg-transparent border-none outline-none font-bold normal-case text-xs text-gray-900" /></div>
                                <div className="md:col-span-3 border rounded-2xl p-4 bg-green-50 shadow-sm"><label className="text-green-700 block mb-2 tracking-widest font-black">Revenue Streams</label><textarea value={b.rev} onChange={e => updateNestedData('bmc', 'rev', e.target.value)} className="w-full h-12 bg-transparent border-none outline-none font-bold normal-case text-xs text-green-900" /></div>
                            </div>
                        </div>
                        );
                    })()}

                    {currentStep === 3 && (() => {
                        const s = projectData.swot;
                        return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black tracking-tighter italic uppercase text-gray-900">Strategy (SWOT)</h2>
                                <div className="px-4 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black tracking-widest shadow-xl shadow-purple-100">BOBOT 15%</div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100"><label className="font-black text-emerald-800 block mb-4 text-xs uppercase tracking-widest italic">Strengths</label><textarea value={s.s} onChange={e => updateNestedData('swot', 's', e.target.value)} rows="5" className="w-full bg-transparent border-none outline-none text-sm font-bold text-emerald-900" /></div>
                                <div className="p-8 rounded-[2rem] bg-rose-50 border-2 border-rose-100"><label className="font-black text-rose-800 block mb-4 text-xs uppercase tracking-widest italic">Weaknesses</label><textarea value={s.w} onChange={e => updateNestedData('swot', 'w', e.target.value)} rows="5" className="w-full bg-transparent border-none outline-none text-sm font-bold text-rose-900" /></div>
                                <div className="p-8 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100"><label className="font-black text-indigo-800 block mb-4 text-xs uppercase tracking-widest italic">Opportunities</label><textarea value={s.o} onChange={e => updateNestedData('swot', 'o', e.target.value)} rows="5" className="w-full bg-transparent border-none outline-none text-sm font-bold text-indigo-900" /></div>
                                <div className="p-8 rounded-[2rem] bg-slate-100 border-2 border-slate-200"><label className="font-black text-slate-800 block mb-4 text-xs uppercase tracking-widest italic">Threats</label><textarea value={s.t} onChange={e => updateNestedData('swot', 't', e.target.value)} rows="5" className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-900" /></div>
                            </div>
                        </div>
                        );
                    })()}

                    {currentStep === 4 && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black tracking-tighter italic uppercase text-green-700">Finance & Profit</h2>
                                <div className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black tracking-widest shadow-xl shadow-green-100">BOBOT 10%</div>
                            </div>
                            
                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex gap-4 items-start shadow-sm">
                                <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Penting: Reminder HPP!</h4>
                                    <p className="text-xs text-amber-800 leading-relaxed">HPP adalah biaya produksi untuk <b>SATU UNIT</b> barang. Jangan masukkan stok bulanan.</p>
                                </div>
                            </div>

                            <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-gray-100 shadow-2xl space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Harga Jual per Unit (Rp):</label>
                                        <input type="number" value={projectData.hpp.sellingPrice} onChange={e => updateNestedData('hpp', 'sellingPrice', e.target.value)} className="w-full p-6 rounded-3xl border-none bg-blue-50 outline-none text-4xl font-black text-blue-600 shadow-inner" placeholder="0" />
                                    </div>
                                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-2 text-gray-400 uppercase font-black text-[9px] tracking-widest">
                                            <span>Total HPP per Unit:</span>
                                            <span className="text-xl text-gray-900">Rp {totalCost.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-400 uppercase font-black text-[9px] tracking-widest">
                                            <span>Margin:</span>
                                            <span className={`text-lg font-black ${margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{margin >= 0 ? "+ Rp " : "- Rp "}{Math.abs(margin).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Rincian Komponen Biaya Produksi (HPP):</label>
                                        <button onClick={addHppRow} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
                                            <i className="fas fa-plus-circle mr-1"></i> Tambah Komponen
                                        </button>
                                    </div>
                                    <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm bg-white">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-5 py-4">Komponen Biaya</th>
                                                    <th className="px-5 py-4 w-40">Biaya (Rp)</th>
                                                    <th className="px-5 py-4 w-12 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projectData.hpp.items.map((item, index) => (
                                                    <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                        <td className="p-0 border-r border-gray-100">
                                                            <input type="text" value={item.name} onChange={e => updateHppItem(index, 'name', e.target.value)} className="w-full p-3 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400" placeholder="Contoh: Kain Linen" />
                                                        </td>
                                                        <td className="p-0 border-r border-gray-100">
                                                            <input type="number" value={item.cost} onChange={e => updateHppItem(index, 'cost', e.target.value)} className="w-full p-3 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400" placeholder="0" />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button onClick={() => removeHppRow(index)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                                <i className="fas fa-times-circle"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (() => {
                        const r = projectData.auditResult;
                        if (!r) return <div className="py-20 text-center animate-pulse text-gray-300 font-bold text-xl uppercase tracking-tighter italic">Menyusun Audit Objektif...</div>;
                        
                        const renderReviewBlock = (title, review, max) => {
                            const weightedScore = parseFloat(((review?.score || 0) / 100) * max).toFixed(1);
                            return (
                                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm transition-all hover:shadow-xl group">
                                    <div className="flex justify-between items-center mb-5">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic group-hover:text-blue-600 transition-colors">{title}</h4>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-blue-600">{weightedScore}</span><span className="text-xs text-gray-300 font-black">/{max}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-50 h-2 rounded-full mb-10 overflow-hidden shadow-inner border border-gray-100">
                                        <div className={`h-full ${(review?.score || 0) < 50 ? 'bg-red-500' : 'bg-blue-600'} transition-all duration-1000`} style={{width: `${review?.score || 0}%`}}></div>
                                    </div>
                                    <div className="text-sm text-gray-600 leading-relaxed text-justify" dangerouslySetInnerHTML={{__html: (review?.feedback || '').replace(/\n/g, '<br>')}} />
                                </div>
                            );
                        };

                        return (
                            <div className="space-y-10">
                                <div className="flex flex-col md:flex-row items-center justify-between border-b-4 border-gray-900 pb-8 gap-6">
                                    <div>
                                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">LAPORAN AUDIT FIKSI</h2>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <span className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{projectData.category}</span>
                                            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">{r.verdict}</span>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Skor Mentor Objektif:</div>
                                        <div className="text-7xl lg:text-8xl font-black text-blue-600 leading-none tracking-tighter">{r.overallScore}<span className="text-xl text-gray-200">/100</span></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-10">
                                        {renderReviewBlock("RINGKASAN EKSEKUTIF", r.reReview, 30)}
                                        {renderReviewBlock("BUSINESS MODEL CANVAS", r.bmcReview, 25)}
                                        {renderReviewBlock("ANALISIS SWOT", r.swotReview, 15)}
                                        {renderReviewBlock("FINANCE & HPP", r.hppReview, 10)}
                                        {renderReviewBlock("INOVASI & ORISINALITAS", r.inovasiReview, 20)}
                                    </div>
                                    
                                    <div className="space-y-8">
                                        <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl sticky top-24">
                                            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-blue-400 flex items-center gap-2 border-b border-white/10 pb-4">
                                                <i className="fas fa-link"></i> Sinkronisasi Data: <span className="ml-auto text-white">{r.syncStatus}</span>
                                            </h3>
                                            <p className="text-sm font-medium leading-loose opacity-80 italic">{r.syncDetails}</p>

                                            <div className="mt-10 pt-10 border-t border-white/10">
                                                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-emerald-400 flex items-center gap-2">
                                                    <i className="fas fa-folder-open"></i> REFERENSI DATA PENDUKUNG:
                                                </h3>
                                                <div className="space-y-3">
                                                    {r.dataPendukung && r.dataPendukung.map((t, i) => (
                                                        <div key={i} className="flex gap-4 text-[10px] font-bold text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                            <i className="fas fa-check-circle mt-0.5 text-emerald-500"></i> <span>{t}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div className="flex justify-between items-center mt-10">
                    <button onClick={() => setCurrentStep(s => s - 1)} className={`px-8 py-4 rounded-2xl border-2 border-gray-200 font-bold text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-all ${currentStep === 0 ? 'hidden' : ''}`}>
                        <i className="fas fa-arrow-left mr-2"></i> Sebelumnya
                    </button>
                    <div className="flex-grow"></div>
                    <button onClick={handleNext} className="px-12 py-5 rounded-2xl bg-gray-900 text-white font-black hover:bg-black shadow-2xl shadow-gray-300 transition-all flex items-center gap-3">
                        <span>{currentStep === 4 ? "LAKUKAN AUDIT FINAL" : currentStep === 5 ? "COPY FULL REPORT" : "Lanjut"}</span> 
                        <i className={currentStep === 4 ? "fas fa-gavel" : currentStep === 5 ? "fas fa-copy" : "fas fa-chevron-right"}></i>
                    </button>
                </div>
            </main>

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-xl text-white">
                    <div className="text-center px-6">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                        <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic">Sedang Menghitung Skor & Audit...</h2>
                        <p className="text-gray-400 max-w-sm mx-auto text-sm">AI Mentor sedang membedah ide secara objektif & transparan.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
