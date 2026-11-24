// Shared validator for the NEWS object. Returns an array of problem strings (empty = valid).
function validateNews(N) {
  const errs = [];
  if (!N || typeof N !== "object") return ["news is not an object"];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(N.date || "")) errs.push("date must be YYYY-MM-DD");
  if (!N.label || !N.tip) errs.push("label and tip are required");
  if (!Array.isArray(N.also)) errs.push("also must be an array");
  if (!Array.isArray(N.items) || !N.items.length) errs.push("items must be a non-empty array");
  (N.items || []).forEach((x, i) => {
    if (!["US", "W"].includes(x.r)) errs.push(`item ${i}: r must be "US" or "W"`);
    for (const k of ["h", "w", "y"]) if (!x[k]) errs.push(`item ${i}: missing ${k}`);
    if (typeof x.p !== "string") errs.push(`item ${i}: p must be a string (use "" if none)`);
    if (!Array.isArray(x.s) || !x.s.length) errs.push(`item ${i}: s needs at least one source`);
  });
  return errs;
}
module.exports = { validateNews };
