const nunjucks = require("nunjucks");

// Configure Nunjucks if needed
nunjucks.configure("views/macros/", { autoescape: true });

describe("textInput Macro", () => {
  test("should render correctly", () => {
    const label = "Label";
    const id = "id";
    const name = "name";
    const placeholder = "placeholder";
    const required = true;
    const value = "value";

    const htmlOutput = nunjucks.renderString(`
        {% from "forminputs.njk" import textInput %}
        {{ textInput("${label}", "${id}", "${name}", "${placeholder}", ${required}, "${value}") }}
      `);

    // Assertions for the structure and attributes of the textInput macro
    expect(htmlOutput).toContain(`<input type="text"`);
    expect(htmlOutput).toContain(`id="${id}"`);
    expect(htmlOutput).toContain(`name="${name}"`);
    expect(htmlOutput).toContain(`placeholder="${placeholder}"`);
    expect(htmlOutput).toContain(`required="${required}"`);
    expect(htmlOutput).toContain(`value="${value}"`);
    expect(htmlOutput).toContain(`for="${id}"`);
    expect(htmlOutput).toContain(`>${label}</label>`);

    // Add more specific checks if necessary
  });
});

describe("emailInput Macro", () => {
  test("should render correctly", () => {
    const label = "Email";
    const id = "emailId";
    const name = "email";
    const placeholder = "Enter your email";
    const required = true;
    const value = "test@example.com";

    const htmlOutput = nunjucks.renderString(`
        {% from "forminputs.njk" import emailInput %}
        {{ emailInput("${label}", "${id}", "${name}", "${placeholder}", ${required}, "${value}") }}
      `);

    // Assertions for the structure and attributes of the emailInput macro
    expect(htmlOutput).toContain(`<input type="email"`);
    expect(htmlOutput).toContain(`id="${id}"`);
    expect(htmlOutput).toContain(`name="${name}"`);
    expect(htmlOutput).toContain(`placeholder="${placeholder}"`);
    expect(htmlOutput).toContain(`required="${required}"`);
    expect(htmlOutput).toContain(`value="${value}"`);
    expect(htmlOutput).toContain(`for="${id}"`);
    expect(htmlOutput).toContain(`>${label}</label>`);

    // Additional checks for email-specific properties
    // (e.g., validation for email format if implemented)
    // Add more specific checks if necessary
  });
});

// Test suite for the textareaInput macro
describe("textareaInput Macro", () => {
  // Test case for rendering the macro with all parameters
  it("should render correctly with all parameters", () => {
    const output = nunjucks.renderString(
      `{% from 'forminputs.njk' import textareaInput %}{{ textareaInput('Test Label', 'testId', 'testName', 'Enter your text...', 'true', 'Sample Value') }}`
    );

    expect(output).toContain("Test Label");
    expect(output).toContain("testId");
    expect(output).toContain("testName");
    expect(output).toContain("Enter your text...");
    expect(output).toContain("true");
    expect(output).toContain("Sample Value");
    // Additional checks can be added to validate the entire structure
  });

  // Additional tests can be added here for different scenarios, like missing parameters or default values
});

describe("selectInput Macro", () => {
  test("should render correctly with string options", () => {
    const stringOptions = ["Option1", "Option2", "Option3"];
    const htmlOutput = nunjucks.renderString(
      `
        {% from "forminputs.njk" import selectInput %}
        {{ selectInput("Test Label", "testId", "testName", true, stringOptions, '') }}
      `,
      { stringOptions }
    ); // Pass stringOptions as context

    // Check for the select and options
    expect(htmlOutput).toContain("<select");
    expect(htmlOutput).toContain('id="testId"');
    expect(htmlOutput).toContain('name="testName"');
    expect(htmlOutput).toContain('required="true"');
    stringOptions.forEach((option) => {
      const regex = new RegExp(
        `<option value="${option}"\\s*>${option}</option>`
      );
      expect(htmlOutput).toMatch(regex);
    });
  });
});

// Test with object options
test("should render correctly with object options", () => {
  const objectOptions = [
    { value: "val1", name: "Name1" },
    { value: "val2", name: "Name2" },
  ];
  const htmlOutput = nunjucks.renderString(
    `
      {% from "forminputs.njk" import selectInput %}
      {{ selectInput("Test Label", "testId", "testName", false, objectOptions, "") }}
    `,
    { objectOptions }
  );

  // Check for the select and options
  objectOptions.forEach((option) => {
    expect(htmlOutput).toContain(
      `<option value="${option.value}">${option.name}</option>`
    );
  });
});

// Test for selected value
test("should correctly select the provided value", () => {
  const options = ["Option1", "Option2", "Option3"];
  const selectedValue = "Option2";
  const htmlOutput = nunjucks.renderString(
    `
      {% from "forminputs.njk" import selectInput %}
      {{ selectInput("Test Label", "testId", "testName", true, options, selectedValue) }}
    `,
    { options, selectedValue }
  );

  const regex = new RegExp(
    `<option value="${selectedValue}"\\s*selected\\s*>${selectedValue}</option>`
  );
  expect(htmlOutput).toMatch(regex);
});

describe("fileupload Macro", () => {
  test("should render correctly with all parameters", () => {
    const label = "Upload File";
    const id = "fileId";
    const name = "file";
    const required = true;
    const currentImage = "currentImage.jpg";
    const cta = "Click to upload";
    const fileRestrictions = "JPEG, PNG only";

    const htmlOutput = nunjucks.renderString(`
            {% from "forminputs.njk" import fileupload %}
            {{ fileupload("${label}", "${id}", "${name}", ${required}, "${currentImage}", "${cta}", "${fileRestrictions}") }}
        `);

    // Assertions for the structure and attributes of the fileupload macro
    expect(htmlOutput).toContain(`<label for="${id}"`);
    expect(htmlOutput).toContain(`>${label}</label>`);
    expect(htmlOutput).toContain(`id="${id}"`);
    expect(htmlOutput).toContain(`name="${name}"`);
    expect(htmlOutput).toContain(`type="file"`);
    expect(htmlOutput).toContain(`${currentImage}`);
    expect(htmlOutput).toContain(`${cta}`);
    expect(htmlOutput).toContain(`${fileRestrictions}`);

    // Add more specific checks if necessary
  });
});
