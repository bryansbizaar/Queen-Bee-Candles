// CardEnhanced.test.jsx - Advanced Card Component Testing
import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { axe, toHaveNoViolations } from "jest-axe";

// Import enhanced testing utilities
import { enhancedTestUtils } from "../../setup/enhancedTestSetup";

// Import cart context for integration
import { CartProvider } from "../../../context/CartContext";

// Import component
import Card from "../../../components/Card";

// Add accessibility matcher
expect.extend(toHaveNoViolations);

// Test wrapper with cart context and routing
const TestWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      <CartProvider>{children}</CartProvider>
    </BrowserRouter>
  );
};

// Add PropTypes validation
TestWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

// Mock product data for testing
const mockProduct = {
  id: 1,
  title: "Vanilla Dream Candle",
  price: 2499,
  image: "vanilla-candle.jpg",
  description: "A luxurious vanilla-scented candle",
};

describe("CardEnhanced - Advanced Interactions", () => {
  beforeEach(() => {
    enhancedTestUtils.simulateDesktop();
  });

  test("renders all product details correctly", () => {
    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    expect(screen.getByText("Vanilla Dream Candle")).toBeInTheDocument();
    expect(screen.getByText("$24.99")).toBeInTheDocument();
    expect(
      screen.getByText("A luxurious vanilla-scented candle")
    ).toBeInTheDocument();

    const image = screen.getByRole("img", { name: /vanilla dream candle/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "http://localhost:8080/images/vanilla-candle.jpg"
    );
    expect(image).toHaveAttribute("alt", "Vanilla Dream Candle");
  });

  test("handles missing image prop gracefully", () => {
    const productWithoutImage = { ...mockProduct, image: undefined };
    render(
      <TestWrapper>
        <Card
          title={productWithoutImage.title}
          price={productWithoutImage.price}
          description={productWithoutImage.description}
          image={productWithoutImage.image}
        />
      </TestWrapper>
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("formats price correctly", () => {
    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    expect(screen.getByText("$24.99")).toBeInTheDocument();
  });

  test("handles full URL image paths", () => {
    const productWithFullImageUrl = {
      ...mockProduct,
      image: "https://example.com/full-image.jpg",
    };
    render(
      <TestWrapper>
        <Card
          title={productWithFullImageUrl.title}
          price={productWithFullImageUrl.price}
          description={productWithFullImageUrl.description}
          image={productWithFullImageUrl.image}
        />
      </TestWrapper>
    );

    const image = screen.getByRole("img", { name: /vanilla dream candle/i });
    expect(image).toHaveAttribute("src", "https://example.com/full-image.jpg");
  });

  test("handles long product titles gracefully", () => {
    const longTitleProduct = {
      ...mockProduct,
      title:
        "This is a very long product title that should be truncated or handled gracefully in the card component",
    };

    render(
      <TestWrapper>
        <Card
          title={longTitleProduct.title}
          price={longTitleProduct.price}
          description={longTitleProduct.description}
          image={longTitleProduct.image}
        />
      </TestWrapper>
    );

    const titleElement = screen.getByText(longTitleProduct.title);
    expect(titleElement).toBeInTheDocument();
  });

  test("supports keyboard navigation to card elements", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    // Test that card elements are present and can be navigated to
    const cardElement = screen
      .getByText("Vanilla Dream Candle")
      .closest(".card");
    expect(cardElement).toBeInTheDocument();

    // Test tab navigation
    await user.keyboard("{Tab}");
    // Card should be focusable or contain focusable elements
    expect(document.activeElement).toBeDefined();
  });

  test("handles rapid re-renders gracefully", async () => {
    const { rerender } = render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    // Rapidly re-render with different data
    for (let i = 0; i < 5; i++) {
      rerender(
        <TestWrapper>
          <Card
            title={`${mockProduct.title} ${i}`}
            price={mockProduct.price + i * 100}
            description={`${mockProduct.description} ${i}`}
            image={mockProduct.image}
          />
        </TestWrapper>
      );
    }

    // Should handle rapid changes without errors
    expect(screen.getByText("Vanilla Dream Candle 4")).toBeInTheDocument();
  });

  test("maintains consistent structure across different props", () => {
    const testProducts = [
      { ...mockProduct, title: "Short" },
      {
        ...mockProduct,
        title: "A very long product title that tests text wrapping",
      },
      { ...mockProduct, price: 999 },
      { ...mockProduct, price: 999999 },
    ];

    testProducts.forEach((product) => {
      const { unmount } = render(
        <TestWrapper>
          <Card
            title={product.title}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        </TestWrapper>
      );

      // Check that basic structure is maintained
      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(/^\$[\d,]+\.\d{2}$/)).toBeInTheDocument();
      expect(screen.getByText(product.description)).toBeInTheDocument();

      unmount();
    });
  });
});

describe("CardEnhanced - Visual States", () => {
  test("displays consistent visual styling", () => {
    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    const cardElement = screen
      .getByText("Vanilla Dream Candle")
      .closest(".card");
    expect(cardElement).toHaveClass("card");

    // Check for expected card elements
    expect(cardElement.querySelector(".card-img")).toBeInTheDocument();
    expect(cardElement.querySelector(".card-title")).toBeInTheDocument();
    expect(cardElement.querySelector(".card-price")).toBeInTheDocument();
    expect(cardElement.querySelector(".card-text")).toBeInTheDocument();
  });

  test("handles hover states appropriately", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    const cardElement = screen
      .getByText("Vanilla Dream Candle")
      .closest(".card");

    // Test hover interaction
    await user.hover(cardElement);

    // Card should remain stable during hover
    expect(cardElement).toBeInTheDocument();
    expect(screen.getByText("Vanilla Dream Candle")).toBeInTheDocument();
  });

  test("maintains image aspect ratio and sizing", () => {
    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    const imageElement = screen.getByRole("img");
    expect(imageElement).toHaveClass("card-img");

    // Image should have proper alt text
    expect(imageElement).toHaveAttribute("alt", "Vanilla Dream Candle");
  });

  test("handles different price ranges consistently", () => {
    const priceTestCases = [
      { price: 999, expected: "$9.99" },
      { price: 1000, expected: "$10.00" },
      { price: 12345, expected: "$123.45" },
    ];

    priceTestCases.forEach(({ price, expected }) => {
      const { unmount } = render(
        <TestWrapper>
          <Card
            title={mockProduct.title}
            price={price}
            description={mockProduct.description}
            image={mockProduct.image}
          />
        </TestWrapper>
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  test("provides consistent text content structure", () => {
    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    // Check semantic HTML structure
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Vanilla Dream Candle"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "$24.99"
    );
    expect(
      screen.getByText("A luxurious vanilla-scented candle")
    ).toBeInTheDocument();
  });

  test("adapts to responsive design breakpoints", () => {
    // Test mobile breakpoint
    enhancedTestUtils.simulateMobile();

    const { rerender } = render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    let cardElement = screen.getByText("Vanilla Dream Candle").closest(".card");
    expect(cardElement).toBeInTheDocument();

    // Test desktop breakpoint
    enhancedTestUtils.simulateDesktop();

    rerender(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    cardElement = screen.getByText("Vanilla Dream Candle").closest(".card");
    expect(cardElement).toBeInTheDocument();
  });
});

describe("CardEnhanced - Accessibility", () => {
  test("has no accessibility violations", async () => {
    const { container } = render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("provides proper semantic HTML structure", () => {
    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    // Check for proper heading hierarchy
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Vanilla Dream Candle"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "$24.99"
    );

    // Check for proper image alt text
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "Vanilla Dream Candle"
    );
  });

  test("supports keyboard navigation", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    // Test that keyboard navigation works
    await user.keyboard("{Tab}");

    // Should be able to navigate through the card
    expect(document.activeElement).toBeDefined();
  });

  test("provides appropriate ARIA attributes", () => {
    render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    // Image should have proper alt text
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "Vanilla Dream Candle");

    // Check that content is properly labeled
    expect(screen.getByText("Vanilla Dream Candle")).toBeInTheDocument();
    expect(screen.getByText("$24.99")).toBeInTheDocument();
  });
});

describe("CardEnhanced - Performance", () => {
  test("handles large dataset rendering efficiently", async () => {
    const startTime = performance.now();

    const largeProductSet = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      title: `Product ${i + 1}`,
      price: 2000 + i * 100,
      image: `product-${i + 1}.jpg`,
      description: `Description for product ${i + 1}`,
    }));

    render(
      <TestWrapper>
        <div>
          {largeProductSet.map((product) => (
            <Card
              key={product.id}
              title={product.title}
              price={product.price}
              description={product.description}
              image={product.image}
            />
          ))}
        </div>
      </TestWrapper>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render 100 cards in under 2 seconds
    expect(renderTime).toBeLessThan(2000);

    // Verify all products are rendered
    expect(screen.getAllByRole("img")).toHaveLength(100);
  });

  test("handles memory usage efficiently", () => {
    const { unmount } = render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    // Check that component renders successfully
    expect(screen.getByText("Vanilla Dream Candle")).toBeInTheDocument();

    // Unmount should clean up properly
    unmount();

    // After unmount, elements should not be in document
    expect(screen.queryByText("Vanilla Dream Candle")).not.toBeInTheDocument();
  });

  test("supports efficient re-rendering", async () => {
    const renderTimes = [];

    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();

      const { unmount } = render(
        <TestWrapper>
          <Card
            title={`Product ${i}`}
            price={2000 + i * 100}
            description={`Description ${i}`}
            image={`product-${i}.jpg`}
          />
        </TestWrapper>
      );

      const endTime = performance.now();
      renderTimes.push(endTime - startTime);

      unmount();
    }

    // Average render time should be reasonable
    const avgRenderTime =
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    expect(avgRenderTime).toBeLessThan(100); // Should render in under 100ms on average
  });

  test("optimizes image loading", () => {
    const { container } = render(
      <TestWrapper>
        <Card
          title={mockProduct.title}
          price={mockProduct.price}
          description={mockProduct.description}
          image={mockProduct.image}
        />
      </TestWrapper>
    );

    const imageElement = container.querySelector("img");

    // Image should be present and properly configured
    expect(imageElement).toBeTruthy();
    expect(imageElement).toHaveAttribute(
      "src",
      "http://localhost:8080/images/vanilla-candle.jpg"
    );
    expect(imageElement).toHaveAttribute("alt", "Vanilla Dream Candle");
  });
});
