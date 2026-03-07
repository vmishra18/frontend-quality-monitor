function resolveLabelledByText(element, scope) {
  const ids = (element.getAttribute('aria-labelledby') || '').split(' ').filter(Boolean);
  if (!ids.length) return '';
  return ids
    .map((id) => document.getElementById(id))
    .filter((node) => node && (!scope || scope.contains(node)))
    .map((node) => node.textContent.trim())
    .join(' ')
    .trim();
}

function getAccessibleName(element, scope) {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
  const labelledByText = resolveLabelledByText(element, scope);
  if (labelledByText) return labelledByText;
  if (element.tagName.toLowerCase() === 'button' || element.getAttribute('role') === 'button') {
    const imgAlt = element.querySelector('img[alt]')?.getAttribute('alt');
    if (imgAlt && imgAlt.trim()) return imgAlt.trim();
  }
  if (element.tagName.toLowerCase() === 'input') {
    const value = element.getAttribute('value');
    if (value && value.trim()) return value.trim();
  }
  const title = element.getAttribute('title');
  if (title && title.trim()) return title.trim();
  return (element.textContent || '').trim();
}

function scanAccessibility() {
  const explicitScope = document.querySelector('[data-a11y-scope]');
  const dashboardRoot = document.getElementById('fpam-root');
  const scope = explicitScope || dashboardRoot || document.body;
  const queryAll = (selector) => Array.from(scope.querySelectorAll(selector));

  const images = queryAll('img');
  const suspiciousAltValues = ['image', 'photo', 'picture', 'graphic', 'logo', 'icon'];
  const missingAlt = images.filter((img) => !img.hasAttribute('alt'));
  const suspiciousAlt = images.filter((img) => {
    if (!img.hasAttribute('alt')) return false;
    const alt = img.getAttribute('alt').trim();
    if (!alt) return false;
    const lowerAlt = alt.toLowerCase();
    if (suspiciousAltValues.includes(lowerAlt)) return true;
    const src = img.getAttribute('src') || '';
    const fileName = src.split('/').pop() || '';
    if (fileName && lowerAlt === fileName.toLowerCase()) return true;
    if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(lowerAlt)) return true;
    return alt.length < 3;
  });

  const buttons = queryAll('button, [role="button"], input[type="button"], input[type="submit"], input[type="image"]');
  const unlabeledButtons = buttons.filter((btn) => {
    if (btn.disabled) return false;
    const label = btn.type === 'image' ? btn.getAttribute('alt') : getAccessibleName(btn, scope);
    return !label || label.trim().length < 2;
  });

  const inputs = queryAll('input, select, textarea').filter((el) => el.type !== 'hidden');
  const unlabeledInputs = inputs.filter((input) => {
    const id = input.getAttribute('id');
    const hasLabel = id && scope.querySelector(`label[for="${id}"]`);
    const wrapped = input.closest('label');
    const ariaLabel = input.getAttribute('aria-label');
    const labelledByText = resolveLabelledByText(input, scope);
    return !hasLabel && !wrapped && !ariaLabel && !labelledByText;
  });

  const headings = queryAll('h1, h2, h3, h4, h5, h6');
  let headingIssue = false;
  let lastLevel = 0;
  let h1Count = 0;
  headings.forEach((heading) => {
    const level = Number(heading.tagName.replace('H', ''));
    if (level === 1) h1Count += 1;
    if (lastLevel && level > lastLevel + 1) headingIssue = true;
    lastLevel = level;
  });

  const landmarkGroups = [
    { label: 'main', selectors: ['main', '[role="main"]'] },
    { label: 'navigation', selectors: ['nav', '[role="navigation"]'] },
    { label: 'header', selectors: ['header', '[role="banner"]'] },
    { label: 'footer', selectors: ['footer', '[role="contentinfo"]'] }
  ];
  const missingRegions = landmarkGroups.filter((group) => !group.selectors.some((selector) => queryAll(selector).length > 0));

  const keyboardTargets = queryAll('[role="button"], [onclick]');
  const keyboardIssues = keyboardTargets.filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return false;
    if (el.tagName.toLowerCase() === 'button') return false;
    if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')) return false;
    if (el.hasAttribute('tabindex')) {
      const tabIndexValue = Number(el.getAttribute('tabindex'));
      return Number.isNaN(tabIndexValue) || tabIndexValue < 0;
    }
    return true;
  });

  const checks = [
    {
      title: 'Image alt text',
      status: missingAlt.length === 0 && suspiciousAlt.length === 0 ? 'Good' : 'Needs Improvement',
      detail:
        missingAlt.length === 0 && suspiciousAlt.length === 0
          ? 'Image alt text looks reasonable (empty alt treated as decorative).'
          : `${missingAlt.length} image(s) missing alt. ${suspiciousAlt.length} image(s) have suspicious alt text.`
    },
    {
      title: 'Button labels',
      status: unlabeledButtons.length === 0 ? 'Good' : 'Needs Improvement',
      detail: unlabeledButtons.length === 0 ? 'Buttons have accessible labels.' : `${unlabeledButtons.length} button(s) may need clearer labels.`
    },
    {
      title: 'Form label association',
      status: unlabeledInputs.length === 0 ? 'Good' : 'Needs Improvement',
      detail: unlabeledInputs.length === 0 ? 'Inputs are labeled or wrapped in labels.' : `${unlabeledInputs.length} input(s) missing associated labels.`
    },
    {
      title: 'Heading order (basic)',
      status: !headingIssue && h1Count <= 1 ? 'Good' : 'Needs Improvement',
      detail:
        !headingIssue && h1Count <= 1
          ? 'Heading levels follow a logical order (basic check).'
          : 'Heading levels may skip order or contain multiple H1s.'
    },
    {
      title: 'Landmark presence (basic)',
      status: missingRegions.length === 0 ? 'Good' : 'Needs Improvement',
      detail:
        missingRegions.length === 0
          ? 'Primary landmarks are present (basic check).'
          : `Missing landmarks: ${missingRegions.map((group) => group.label).join(', ')}.`
    },
    {
      title: 'Keyboard reachability (basic)',
      status: keyboardIssues.length === 0 ? 'Good' : 'Needs Improvement',
      detail:
        keyboardIssues.length === 0
          ? 'No obvious click-only elements detected.'
          : `${keyboardIssues.length} element(s) look clickable but may not be focusable.`
    },
    {
      title: 'Color contrast',
      status: 'Manual Review',
      detail: 'Verify contrast using UI states and brand colors. Use a contrast checker during QA.'
    }
  ];

  const passed = checks.filter((check) => check.status === 'Good').length;
  const issues = checks.filter((check) => check.status === 'Needs Improvement').length;
  const manual = checks.filter((check) => check.status === 'Manual Review').length;

  return {
    checks,
    passed,
    issues,
    manual
  };
}

module.exports = {
  scanAccessibility
};
