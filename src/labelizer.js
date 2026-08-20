function Labelizer() {}

const accentMarks = new Map([
  ['hat', '\u0302'], // combining circumflex accent
  ['bar', '\u0304'], // combining macron
  ['tilde', '\u0303'], // combining tilde
]);
const accentRg = /\\(hat|bar|tilde)\{([^}]*)\}/gu;

/**
 * Fold LaTeX accent commands into their base as a Unicode combining mark.
 *
 * The result is normalized to NFC, which yields the precomposed character when
 * Unicode has one (\hat{y} gives U+0177) and keeps the combining sequence
 * otherwise (\hat{x}). A multi-character base is accented on its first
 * character.
 *
 * @param {string} str A label segment, possibly holding \hat, \bar or \tilde.
 * @returns {string} The segment with every accent command replaced.
 */
function accentize(str) {
  return str.replace(accentRg, (match, cmd, content) => {
    const [first, ...rest] = [...content];
    if (first === undefined) {
      return '';
    }
    return (first + accentMarks.get(cmd) + rest.join('')).normalize('NFC');
  });
}

/**
 * Remove the braces grouping a subscript or a superscript.
 *
 * As in LaTeX the braces group without being displayed, so x^{(0)} and x^(0)
 * render the same. A string that is not entirely wrapped in braces is returned
 * unchanged.
 *
 * @param {string} str A subscript or superscript content, braces included.
 * @returns {string} The content without its surrounding braces.
 */
function stripBraces(str) {
  const m = str.match(/^\{([^}]*)\}$/u);
  return m ? m[1] : str;
}

// A label token is a base, optionally preceded by a process numbering prefix and
// followed by a subscript and a superscript. Base, subscript and superscript are made
// of Unicode letters, combining marks and numbers, plus the characters used by HTML
// entities (&#x03BB;) and usual separators. Braces and backslashes belong to the base
// so that anything this subset does not handle stays literal instead of being
// silently dropped. Each part is matched on its own rather than by one big pattern:
// an optional group holding a quantifier raises the star height, which ReDoS linters
// reject, and writing it as an empty alternative only trades one warning for another.
const baseCharRg = /[&#;\p{L}\p{M}\p{N}\-. {}\\]/u;
const baseRg = /^[&#;\p{L}\p{M}\p{N}\-. {}\\]+/u;
const numberingRg = /^[0-9-]+:/u;
const subRg = /^_(?:\{[^}]*\}|[&#;\p{L}\p{M}\p{N}\-._]+)/u;
const supRg = /^\^.+/u;

/**
 * Split one label token into its base, subscript and superscript.
 *
 * Leading characters that cannot start a base are skipped, as they were by the
 * unanchored pattern this replaces. The numbering prefix is only taken when a base
 * follows it, so a trailing colon stays part of the base.
 *
 * @param {string} str One comma separated label token, already accent-folded.
 * @returns {?{base: string, sub: (string|undefined), sup: (string|undefined)}} The
 *   parsed token, or null when the token holds no base character at all.
 */
function parseToken(str) {
  const start = str.search(baseCharRg);
  if (start === -1) {
    return null;
  }
  let rest = str.slice(start);
  let prefix = '';
  const numbering = rest.match(numberingRg);
  if (numbering && baseRg.test(rest.slice(numbering[0].length))) {
    [prefix] = numbering;
    rest = rest.slice(prefix.length);
  }
  const [base] = rest.match(baseRg);
  rest = rest.slice(base.length);
  const sub = rest.match(subRg);
  if (sub) {
    rest = rest.slice(sub[0].length);
  }
  const sup = rest.match(supRg);
  return {
    base: prefix + base,
    sub: sub ? stripBraces(sub[0].substring(1)) : undefined,
    sup: sup ? stripBraces(sup[0].substring(1)) : undefined,
  };
}

Labelizer.strParse = function strParse(str, subSupScript) {
  if (str === '') {
    return [{ base: '', sub: undefined, sup: undefined }];
  }
  // A label is a comma separated list; the separating space belongs to the
  // separator, not to the name, and spaces inside a name are kept.
  const lstr = str.split(',').map((s) => s.trim());
  if (subSupScript === false) {
    return lstr.map((s) => ({ base: s, sub: undefined, sup: undefined }));
  }

  const underscores = /_/g;

  const res = lstr.map((raw) => {
    const s = accentize(raw);

    if ((s.match(underscores) || []).length > 1) {
      const mu = s.match(/(.+)\^(.+)/);
      if (mu) {
        return { base: mu[1], sub: undefined, sup: stripBraces(mu[2]) };
      }
      return { base: s, sub: undefined, sup: undefined };
    }
    const token = parseToken(s);
    if (!token) {
      throw new Error(`Labelizer.strParse: Can not parse '${raw}'`);
    }
    return token;
  }, this);

  return res;
};

Labelizer._createVarListLabel = function _createVarListLabel(
  selection,
  name,
  text,
  ellipsis,
  subSupScript,
  subXdsmLink
) {
  const tokens = Labelizer.strParse(name, subSupScript);

  tokens.every((token, i, ary) => {
    let offsetSub = 0;
    let offsetSup = 0;
    if (ellipsis < 1 || (i < 5 && text.nodes()[0].getBBox().width < 100)) {
      text.append('tspan').html(() => {
        if (subXdsmLink) {
          return `<a class='subxdsm-link' href="#${subXdsmLink}">${token.base}</a>`;
        }
        return token.base;
      });
      if (token.sub) {
        offsetSub = 10;
        text.append('tspan').attr('class', 'sub').attr('dy', offsetSub).html(token.sub);
      }
      if (token.sup) {
        offsetSup = -10;
        text
          .append('tspan')
          .attr('class', 'sup')
          .attr('dx', -5)
          .attr('dy', -offsetSub + offsetSup)
          .html(token.sup);
        offsetSub = 0;
      }
    } else {
      text
        .append('tspan')
        .attr('dy', -offsetSub - offsetSup)
        .html('...');
      selection.classed('ellipsized', true);
      return false;
    }
    if (i < ary.length - 1) {
      text
        .append('tspan')
        .attr('dy', -offsetSub - offsetSup)
        .html(', ');
    }
    return true;
  }, this);
};

Labelizer._createLinkNbLabel = function _createLinkNbLabel(selection, name, text) {
  const lstr = name.split(',');
  let str = `${lstr.length} var`;
  if (lstr.length > 1) {
    str += 's';
  }
  text.append('tspan').html(str);
  selection.classed('ellipsized', true); // activate tooltip
};

Labelizer.labelize = function labelize() {
  let ellipsis = 0;
  let subSupScript = true;
  let linkNbOnly = false;
  let labelKind = 'node';
  let subXdsmLink = false;

  function createLabel(selection) {
    selection.each((d) => {
      const text = selection.append('text');
      if (linkNbOnly && labelKind !== 'node') {
        // show connexion nb
        Labelizer._createLinkNbLabel(selection, d.name, text);
      } else {
        Labelizer._createVarListLabel(selection, d.name, text, ellipsis, subSupScript, subXdsmLink);
      }
    });
  }

  createLabel.ellipsis = function ellips(value) {
    if (!arguments.length) {
      return ellipsis;
    }
    ellipsis = value;
    return createLabel;
  };

  createLabel.subSupScript = function subsupscript(value) {
    if (!arguments.length) {
      return subSupScript;
    }
    subSupScript = value;
    return createLabel;
  };

  createLabel.linkNbOnly = function linknbonly(value) {
    if (!arguments.length) {
      return linkNbOnly;
    }
    linkNbOnly = value;
    return createLabel;
  };

  createLabel.labelKind = function labelkind(value) {
    if (!arguments.length) {
      return labelKind;
    }
    labelKind = value;
    return createLabel;
  };

  createLabel.subXdsmLink = function subxdsmlink(value) {
    if (!arguments.length) {
      return subXdsmLink;
    }
    subXdsmLink = value;
    return createLabel;
  };

  return createLabel;
};

Labelizer.tooltipize = function tooltipz() {
  let text = '';
  let subSupScript = false;

  function createTooltip(selection) {
    let html = [];
    if (subSupScript) {
      const tokens = Labelizer.strParse(text);
      tokens.forEach((token) => {
        let item = token.base;
        if (token.sub) {
          item += `<sub>${token.sub}</sub>`;
        }
        if (token.sup) {
          item += `<sup>${token.sup}</sup>`;
        }
        html.push(item);
      });
    } else {
      html = text.split(',');
    }
    selection.html(html.join(', '));
  }

  createTooltip.text = function txt(value) {
    if (!arguments.length) {
      return text;
    }
    text = value;
    return createTooltip;
  };

  createTooltip.subSupScript = function supsub(value) {
    if (!arguments.length) {
      return subSupScript;
    }
    subSupScript = value;
    return createTooltip;
  };

  return createTooltip;
};

export default Labelizer;
