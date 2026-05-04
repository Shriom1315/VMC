function ModuleAccents({ label }: { label?: string }) {
  return (
    <>
      <div className="crosshair crosshair-tl -top-[1px] -left-[1px]" />
      <div className="crosshair crosshair-tr -top-[1px] -right-[1px]" />
      <div className="crosshair crosshair-bl -bottom-[1px] -left-[1px]" />
      <div className="crosshair crosshair-br -bottom-[1px] -right-[1px]" />
    </>
  );
}

export default ModuleAccents;
