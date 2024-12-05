describe("checks tool reservation path", () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173/")
      .get("header nav div")
      .find("a[href='/login']")
      .click()
      .get("form")
      .find("input[type='email']")
      .should("exist")
      .type("adis@adonis2.com")
      .get("form")
      .find("input[type='password']")
      .should("exist")
      .type("Adis123!")
      .get("form")
      .find("button")
      .click()
      .get("header nav div span")
      .should("contain.text", "Welcome");
  });
  it("tries to place a reservation", () => {
    cy.get("header nav div")
      .find("a[href='/tools']")
      .click()
      .get("h3")
      .should("exist")
      .should("contain.text", "Generators")
      .get("div div div div div div")
      .find("a[href^='/tools']")
      .first()
      .click()
      .get("a")
      .contains("reservation")
      .click()
      .get("form")
      .find('select[name="toolType"]')
      .select('Generators')
      .get("form")
      .find('select[name="tool"]')
      .select(1)
      .get("form")
      .find('input[name="quantity"]')
      .clear()
      .type('1')
      .get("form")
      .find('select[name="pickupLocation"]')
      .select(1)
      .get("form")
      .find('input[type="checkbox"]')
      .check()
      .get("form")
      .find('button[type="submit"]')
      .click()
      .get("h2")
      .should("contain.text", "Reservation Approved!")
      .get("header nav div")
        .find("a[href='/profile']")
        .click()
        .get("h2")
        .should("exist")
        .should("contain.text", "Profile Dashboard")
        .get("div div.container div.grid a")
        .contains('My Reservations')
        .click()
        .get("div div.container div h2")
        .should("contain.text", "My Reservations")
        .get('table tr td')
        .first()
        .should("contain.text", "Generatorius")
  });
});
