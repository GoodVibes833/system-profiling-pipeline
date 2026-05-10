import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/SearchBar";

describe("SearchBar", () => {
  it("placeholder가 표시된다", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("장소, 음식, 태그 검색...")).toBeInTheDocument();
  });

  it("커스텀 placeholder가 표시된다", () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="맛집 찾기..." />);
    expect(screen.getByPlaceholderText("맛집 찾기...")).toBeInTheDocument();
  });

  it("입력 시 onChange가 호출된다", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    const input = screen.getByLabelText("검색");
    fireEvent.change(input, { target: { value: "카페" } });
    expect(onChange).toHaveBeenCalledWith("카페");
  });

  it("값이 있을 때 지우기 버튼이 표시된다", () => {
    render(<SearchBar value="카페" onChange={() => {}} />);
    expect(screen.getByLabelText("검색어 지우기")).toBeInTheDocument();
  });

  it("값이 없을 때 지우기 버튼이 표시되지 않는다", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("검색어 지우기")).not.toBeInTheDocument();
  });

  it("지우기 버튼 클릭 시 onChange가 빈 문자열로 호출된다", () => {
    const onChange = vi.fn();
    render(<SearchBar value="카페" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("검색어 지우기"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("onFilterToggle이 없으면 필터 버튼이 표시되지 않는다", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("필터")).not.toBeInTheDocument();
  });

  it("onFilterToggle이 있으면 필터 버튼이 표시된다", () => {
    render(<SearchBar value="" onChange={() => {}} onFilterToggle={() => {}} />);
    expect(screen.getByLabelText("필터")).toBeInTheDocument();
  });

  it("필터 버튼 클릭 시 onFilterToggle이 호출된다", () => {
    const onFilterToggle = vi.fn();
    render(<SearchBar value="" onChange={() => {}} onFilterToggle={onFilterToggle} />);
    fireEvent.click(screen.getByLabelText("필터"));
    expect(onFilterToggle).toHaveBeenCalledTimes(1);
  });

  it("showFilters=true일 때 필터 버튼 스타일이 활성화된다", () => {
    const { container } = render(
      <SearchBar value="" onChange={() => {}} onFilterToggle={() => {}} showFilters />
    );
    const filterBtn = screen.getByLabelText("필터");
    expect(filterBtn).toHaveClass("bg-white");
    expect(filterBtn).toHaveClass("text-slate-900");
  });
});
