function classify(si, p, type) {
    let category = '';
    let warning = '';

    if (si <= 0.01) {
        category = 'X';
    } else if (type === 'hot' && si <= 0.04 && p < 0.02 && (si + 2.5 * p <= 0.09)) {
        category = 'A';
    } else if (type === 'cold' && (si + 2.5 * p <= 0.04)) {
        category = 'A';
    } else if (si > 0.25) {
        category = 'D';
    } else if (si > 0.14 && si <= 0.25) {
        category = 'B';
    } else if (si > 0.04 && si <= 0.14) {
        category = 'C';
    } else {
        category = 'C';
    }

    if (p >= 0.02 && category !== 'D') {
        warning = 'Phosphorus content high; downgraded to Category C.';
        category = 'C';
    }

    return { category, warning };
}

const characteristics = {
    X: {
        appearance: 'shiny',
        mechanical: 'Excellent',
        mass: 'Standard',
        compliance: 'Pass',
        usecase: 'Aesthetic focus'
    },
    A: {
        appearance: 'shiny',
        mechanical: 'Excellent',
        mass: 'Standard',
        compliance: 'Pass',
        usecase: 'General structural'
    },
    B: {
        appearance: 'mottled or patchy',
        mechanical: 'Good',
        mass: 'Heavier than normal',
        compliance: 'Conditional',
        usecase: 'Structural protection'
    },
    C: {
        appearance: 'dull or coarse',
        mechanical: 'Reduced',
        mass: 'Extra heavy',
        compliance: 'Conditional',
        usecase: 'Long-term corrosion protection'
    },
    D: {
        appearance: 'dull, coarse with flaking risk',
        mechanical: 'Reduced',
        mass: 'Extra heavy',
        compliance: 'Fail',
        usecase: 'Long-term corrosion protection'
    }
};

document.getElementById('composition-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const si = parseFloat(document.getElementById('si').value);
    const p = parseFloat(document.getElementById('p').value);
    const type = document.getElementById('steel-type').value;

    const { category, warning } = classify(si, p, type);
    const info = characteristics[category];

    document.getElementById('category').textContent = category;
    document.getElementById('appearance').textContent = info.appearance;
    document.getElementById('mechanical').textContent = info.mechanical;
    document.getElementById('mass').textContent = info.mass;
    document.getElementById('compliance').textContent = info.compliance;
    document.getElementById('usecase').textContent = info.usecase;
    document.getElementById('warning').textContent = warning;

    document.getElementById('result').classList.remove('hidden');
});
