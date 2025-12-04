// Theme handling
function toggleTheme() {
    const checkbox = document.getElementById('theme-checkbox');
    const newTheme = checkbox.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const checkbox = document.getElementById('theme-checkbox');
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (checkbox) checkbox.checked = savedTheme === 'dark';
}

initTheme();

const categoryProfiles = {
    ULR: {
        label: 'ULR',
        reactivity: 'Very low — bright, thin coating expected.',
        appearance: 'Bright, smooth, thinner coating typical of ultra-low reactivity steels (Si < 0.01%).',
        conformance: { level: 'high', text: 'Likely to meet AS/NZS 4680 Table 4 for ULR steels.' },
        risks: ['Thin coating compared with standard categories; appearance will differ if mixed with other chemistries.'],
        advice: ['Standard pre-treatment is sufficient; avoid unnecessary abrasive blasting that could drive higher pick-up.']
    },
    A: {
        label: 'A',
        reactivity: 'Low to moderate — bright to semi-bright.',
        appearance: 'Si 0.01–0.04 with low P normally gives a bright smooth coating.',
        conformance: { level: 'high', text: 'Expected to meet AS/NZS 4680 Table 3 thickness requirements.' },
        risks: ['Appearance can vary at heavy section changes if cooling is slow.'],
        advice: ['Normal HDG practice; share cosmetic expectations if a bright finish is important.']
    },
    B: {
        label: 'B',
        reactivity: 'Moderate to high — mottled or grey, thicker coating likely.',
        appearance: 'Si 0.14–0.25 often produces mottled/patchy coatings and thicker build-up above Table 3 values.',
        conformance: { level: 'medium', text: 'May exceed AS/NZS 4680 Table 3 thickness; align finish expectations.' },
        risks: ['Thicker coatings reduce mechanical toughness at edges and corners.'],
        advice: ['Control immersion and cooling; radius edges and communicate likely grey appearance.']
    },
    C: {
        label: 'C',
        reactivity: 'Medium-high — extra thick/coarse coating possible.',
        appearance: 'Si 0.04–0.14 (Category C) can create coarse, thick coatings with brittle alloy layers on heavy sections.',
        conformance: { level: 'medium', text: 'Usually meets AS/NZS 4680 but can over-thicken; manage kettle time.' },
        risks: ['Higher risk of brittle alloy layers leading to damage at edges during handling.'],
        advice: ['Pre-grind oxide and sharp edges; request controlled immersion/cooling on heavy pieces.']
    },
    D: {
        label: 'D',
        reactivity: 'High — very reactive, thick grey coating likely.',
        appearance: 'Si > 0.25 produces thick dull grey coatings with possible flaking between alloy layers.',
        conformance: { level: 'low', text: 'Unlikely to match AS/NZS 4680 thickness targets without tight control.' },
        risks: ['Excessive coating thickness and flaking risk, especially at corners and impact points.'],
        advice: ['Ask for reduced immersion time, careful cooling, and handling to limit cracking/flaking.']
    }
};

function getNumber(id) {
    const value = parseFloat(document.getElementById(id).value);
    return Number.isFinite(value) ? value : null;
}

function getText(id) {
    return document.getElementById(id).value.trim();
}

function classifyChemistry(si, p) {
    if (!Number.isFinite(si) || !Number.isFinite(p)) {
        return { category: null, profile: null, reasons: ['Provide silicon and phosphorus values.'], phosphorusHigh: false };
    }

    let category = 'C';
    const reasons = [];

    if (si < 0.01) {
        category = 'ULR';
        reasons.push('Si below 0.01% (ULR band).');
    } else if (si <= 0.04 && p < 0.02 && si + 2.5 * p <= 0.09) {
        category = 'A';
        reasons.push('Si 0.01–0.04 with low P and Si + 2.5P ≤ 0.09 (Category A).');
    } else if (si >= 0.25) {
        category = 'D';
        reasons.push('Si above 0.25% (Category D reactive steel).');
    } else if (si >= 0.14) {
        category = 'B';
        reasons.push('Si 0.14–0.25 (Category B).');
    } else {
        category = 'C';
        reasons.push('Si 0.04–0.14 (Category C band).');
    }

    const phosphorusHigh = p >= 0.035;
    if (phosphorusHigh) {
        reasons.push('P above 0.035% can increase coating thickness and mottling.');
    }

    return { category, profile: categoryProfiles[category], reasons, phosphorusHigh };
}

function buildAdvisory(inputs) {
    const classification = classifyChemistry(inputs.si, inputs.p);
    if (!classification.profile) {
        return null;
    }

    const profile = classification.profile;
    const risks = new Set(profile.risks);
    const advice = new Set(profile.advice);

    let compliance = { ...profile.conformance };
    let appearance = profile.appearance;

    if (classification.phosphorusHigh) {
        risks.add('High phosphorus (>0.035%) can drive thicker, rough coatings and brittleness.');
        advice.add('Discuss tighter kettle time/quench control and inspect for brittle alloy layers.');
        if (compliance.level === 'high') compliance.level = 'medium';
    }

    if (inputs.al && inputs.al > 0.035 && ['A', 'C'].includes(classification.category)) {
        risks.add('Aluminium above 0.035% can thin the coating; expect appearance variation.');
        advice.add('Confirm aluminium level with mill cert if consistent appearance is critical.');
    }

    if (inputs.surface === 'blasted') {
        risks.add('Abrasive blasting increases surface area and coating pickup; expect thicker zinc build.');
        advice.add('Confirm blasting is required; otherwise mill scale removal only may be preferable.');
    }

    if (inputs.surface === 'cold-formed') {
        risks.add('Cold-formed hollow sections (esp. C450 CHS) can sit near Category D silicon (~0.45%); verify mill certs.');
        advice.add('Ask for chemistry certificate on CHS to avoid reactive mixes across suppliers.');
    }

    if (inputs.fabrication === 'laser-cut' || inputs.fabrication === 'plasma-cut') {
        risks.add('Laser/plasma cutting alters surface chemistry and leaves oxides that can reduce adhesion.');
        advice.add('Grind back heat-affected zones and remove oxide before galvanizing.');
    }

    if (inputs.fabrication === 'welded') {
        risks.add('Weld metal and flux residues can change local reactivity and create patchy coatings.');
        advice.add('Clean welds thoroughly, radius edges, and remove slag/flux prior to dipping.');
    }

    if (inputs.thickness && inputs.thickness >= 20 && ['B', 'C', 'D'].includes(classification.category)) {
        risks.add('Thick sections with reactive chemistry can create very heavy coatings and flaking at edges.');
        advice.add('Request controlled immersion/cooling and chamfer or radius sharp edges.');
        if (compliance.level === 'high') compliance.level = 'medium';
    }

    if (inputs.fabricationNotes) {
        advice.add(`Fabrication notes: ${inputs.fabricationNotes}`);
    }

    const reactivityText = `${classification.category} — ${profile.reactivity}`;
    const complianceText = compliance.text;

    return {
        category: classification.category,
        reactivity: reactivityText,
        appearance,
        compliance: { level: compliance.level, text: complianceText },
        risks: Array.from(risks),
        advice: Array.from(advice)
    };
}

function renderResult(advisory, inputs) {
    if (!advisory) return;

    const resultSection = document.getElementById('result');
    document.getElementById('category-badge').textContent = `Category ${advisory.category}`;
    document.getElementById('reactivity').textContent = advisory.reactivity;
    document.getElementById('appearance').textContent = advisory.appearance;

    const complianceEl = document.getElementById('compliance');
    complianceEl.textContent = advisory.compliance.text;
    complianceEl.className = 'value status';
    if (advisory.compliance.level === 'medium') complianceEl.classList.add('warn');
    if (advisory.compliance.level === 'low') complianceEl.classList.add('fail');

    const riskList = document.getElementById('risks');
    riskList.innerHTML = '';
    (advisory.risks.length ? advisory.risks : ['No major risks flagged beyond standard practice.']).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        riskList.appendChild(li);
    });

    const adviceList = document.getElementById('advice');
    adviceList.innerHTML = '';
    (advisory.advice.length ? advisory.advice : ['Proceed with standard HDG preparation.']).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        adviceList.appendChild(li);
    });

    const traceParts = [];
    if (inputs.supplier) traceParts.push(`Supplier: ${inputs.supplier}`);
    if (inputs.heat) traceParts.push(`Heat: ${inputs.heat}`);
    document.getElementById('traceability').textContent = traceParts.length ? traceParts.join(' • ') : 'No supplier / heat noted.';

    const snapshotParts = [];
    if (inputs.grade) snapshotParts.push(inputs.grade);
    if (inputs.thickness) snapshotParts.push(`${inputs.thickness} mm`);
    if (inputs.surfaceLabel) snapshotParts.push(inputs.surfaceLabel);
    if (inputs.fabricationLabel) snapshotParts.push(inputs.fabricationLabel);
    document.getElementById('snapshot').textContent = snapshotParts.length ? snapshotParts.join(' • ') : 'No additional product context provided.';

    resultSection.classList.remove('hidden');
}

function mapSurfaceLabel(value) {
    const labels = {
        'hot-rolled': 'Hot rolled',
        'cold-formed': 'Cold formed / hollow section',
        'blasted': 'Abrasive blasted',
        'pickled': 'Pickled & oiled',
        'as-fabricated': 'As fabricated'
    };
    return labels[value] || value;
}

function mapFabricationLabel(value) {
    const labels = {
        'standard': 'Standard fabrication',
        'laser-cut': 'Laser cut',
        'plasma-cut': 'Plasma / flame cut',
        'welded': 'Welded / heavy welds',
        'machined': 'Machined'
    };
    return labels[value] || value;
}

document.getElementById('composition-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const inputs = {
        si: getNumber('si'),
        p: getNumber('p'),
        c: getNumber('c'),
        mn: getNumber('mn'),
        al: getNumber('al'),
        grade: getText('grade'),
        thickness: getNumber('thickness'),
        surface: document.getElementById('surface').value,
        fabrication: document.getElementById('fabrication').value,
        fabricationNotes: getText('fabrication-notes'),
        supplier: getText('supplier'),
        heat: getText('heat-number')
    };

    inputs.surfaceLabel = mapSurfaceLabel(inputs.surface);
    inputs.fabricationLabel = mapFabricationLabel(inputs.fabrication);

    const advisory = buildAdvisory(inputs);
    renderResult(advisory, inputs);
});

function exportPdf() {
    const main = document.querySelector('main');
    if (!main) return;

    if (typeof html2pdf === 'undefined') {
        alert('PDF exporter failed to load. Please check your connection and try again.');
        return;
    }

    const previousTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const themeToggle = document.getElementById('theme-checkbox');
    const previousToggle = themeToggle ? themeToggle.checked : null;
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.checked = false;

    const previousScroll = window.scrollY;
    window.scrollTo(0, 0);

    const filename = `galvanizing-advisory-${Date.now()}.pdf`;
    const options = {
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, windowWidth: document.documentElement.clientWidth, windowHeight: document.documentElement.scrollHeight },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    document.body.classList.add('pdf-exporting');
    html2pdf().from(main).set(options).save().finally(() => {
        document.body.classList.remove('pdf-exporting');
        document.documentElement.setAttribute('data-theme', previousTheme);
        if (themeToggle && previousToggle !== null) themeToggle.checked = previousToggle;
        window.scrollTo(0, previousScroll);
    });
}

document.getElementById('export-pdf').addEventListener('click', exportPdf);
