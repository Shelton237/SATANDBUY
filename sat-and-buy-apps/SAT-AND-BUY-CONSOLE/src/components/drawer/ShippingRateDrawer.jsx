import { useContext, useEffect, useMemo, useState } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Input, Select, Textarea } from "@windmill/react-ui";

import Title from "@/components/form/others/Title";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import { SidebarContext } from "@/context/SidebarContext";
import ShippingRateServices from "@/services/ShippingRateServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const createDefaultForm = () => ({
  country: "",
  city: "",
  label: "",
  description: "",
  estimatedTime: "",
  cost: "",
  status: "active",
});

const ShippingRateDrawer = ({ rate, isAdmin }) => {
  const { toggleDrawer, setIsUpdate, setServiceId, isDrawerOpen } =
    useContext(SidebarContext);
  const [form, setForm] = useState(createDefaultForm);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(rate?.id);

  useEffect(() => {
    if (isEditing) {
      setForm({
        country: rate.country || "",
        city: rate.city || "",
        label: rate.label || "",
        description: rate.description || "",
        estimatedTime: rate.estimatedTime || "",
        cost:
          typeof rate.cost === "number" ? rate.cost.toString() : rate.cost || "",
        status: rate.status || "active",
      });
    } else {
      setForm(createDefaultForm());
    }
  }, [rate, isEditing, isDrawerOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = {
      country: form.country.trim(),
      city: form.city.trim(),
      label: form.label.trim(),
      description: form.description.trim(),
      estimatedTime: form.estimatedTime.trim(),
      cost: form.cost,
      status: form.status,
    };

    if (!trimmed.country || !trimmed.city || !trimmed.label || !trimmed.cost) {
      notifyError("Country, city, label and cost are required.");
      return;
    }

    const payload = {
      ...trimmed,
      cost: Number(trimmed.cost),
    };

    if (Number.isNaN(payload.cost) || payload.cost < 0) {
      notifyError("Cost must be a positive number.");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await ShippingRateServices.update(rate.id, payload);
        notifySuccess("Shipping rate updated.");
      } else {
        await ShippingRateServices.add(payload);
        notifySuccess("Shipping rate created.");
      }
      setIsUpdate(true);
      setServiceId(null);
      toggleDrawer();
    } catch (err) {
      notifyError(err?.message || "Unable to save shipping rate.");
    } finally {
      setSaving(false);
    }
  };

  const approvalMessage = useMemo(() => {
    if (isAdmin) {
      return "Approve logistic rates to expose them to the checkout.";
    }
    return "Your rate will remain hidden until an administrator validates it.";
  }, [isAdmin]);

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
        <Title
          title={isEditing ? "Update shipping rate" : "Create shipping rate"}
          description="Specify the location, pricing and delivery window for this shipping option."
        />
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-6/12 xl:w-5/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6 flex-grow scrollbar-hide w-full max-h-full pb-40 space-y-6">
            <div className="p-3 rounded-md bg-blue-50 border border-blue-100 text-sm text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-100">
              {approvalMessage}
            </div>

            <InputField label="Country">
              <Input
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Cameroun"
              />
            </InputField>

            <InputField label="City">
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Douala"
              />
            </InputField>

            <InputField label="Label">
              <Input
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="Express 24h"
              />
            </InputField>

            <InputField label="Cost (FCFA)">
              <Input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={handleChange}
                placeholder="1500"
              />
            </InputField>

            <InputField label="Estimated time window">
              <Input
                name="estimatedTime"
                value={form.estimatedTime}
                onChange={handleChange}
                placeholder="24h - 48h"
              />
            </InputField>

            <InputField label="Description">
              <Textarea
                rows="3"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Notes displayed to the courier team."
                className="border border-gray-200 dark:border-gray-600"
              />
            </InputField>

            <InputField label="Status">
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-12"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </InputField>
          </div>

          <DrawerButton
            id={isEditing ? rate.id : null}
            title="Shipping rate"
            isSubmitting={saving}
          />
        </form>
      </Scrollbars>
    </>
  );
};

const InputField = ({ label, children }) => (
  <div className="grid grid-cols-6 gap-3">
    <LabelArea label={label} />
    <div className="col-span-8 sm:col-span-4">{children}</div>
  </div>
);

export default ShippingRateDrawer;
