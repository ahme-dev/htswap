export const initScript = (): Cypress.Chainable<string> =>
	cy
		.readFile("dist/htswap.js", "utf8")
		.then((code) => `<script type="module">${code};</script>`);

export type TMultipartFormDataReq = {
	headers: Record<string, string>;
	body: string;
};

export const parseMultipartFormData = (
	req: TMultipartFormDataReq,
): Record<string, string> => {
	const contentType = req.headers["content-type"];
	const boundary = contentType.split("boundary=")[1];
	const body = req.body;

	const parts = body
		.split(`--${boundary}`)
		.map((s) => s.trim())
		.filter((s) => s.startsWith("Content-Disposition: form-data;"));

	const formData: Record<string, string> = {};
	parts.forEach((part) => {
		const lines = part.split(/\r?\n/g);
		const keyMatch = lines[0].match(/name="(.+)"/);
		if (keyMatch) {
			const key = keyMatch[1];
			formData[key] = lines.length >= 2 ? lines[2].trim() : "";
		}
	});

	return formData;
};
