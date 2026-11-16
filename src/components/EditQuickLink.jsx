import { Dialog, DialogPanel, DialogTitle, Button, Input, Label, Field } from '@headlessui/react';
import { useState, useEffect } from 'react';
import '/src/styles/chrome.css';

const FieldOption = ({ name, type, state }) => {
  const [form, setForm] = state;

  return (
    <Field>
      <Label className="cm-label">{name}</Label>
      <div className="cm-field">
        <Input
          className="w-full"
          value={form[type]}
          onChange={(e) => setForm({ ...form, [type]: e.target.value })}
        />
      </div>
    </Field>
  );
};

const EditQuickLink = ({ state, set, update, initialData }) => {
  const [form, setForm] = useState({
    name: '',
    icon: '',
    link: '',
  });

  useEffect(() => {
    if (initialData && state) {
      setForm({
        name: initialData.name || '',
        icon: initialData.icon || '',
        link: initialData.link || '',
      });
    }
  }, [initialData, state]);

  const regex = (link) => (/^(https?:)?\/\//.test(link) ? link : `https://${link}`);

  const clear = () => {
    setForm({
      name: '',
      icon: '',
      link: '',
    });
  };

  const action = () => {
    set(false);
    update({
      ...form,
      link: regex(form.link.trim()),
      icon: regex(form.icon.trim()),
    });
    clear();
  };

  const filled = () => !!(form.name && form.link);

  return (
    <Dialog open={state} onClose={() => set(false)} className="cm-backdrop">
      <div className="flex justify-center items-center h-full p-4">
        <DialogPanel className="cm-dialog w-[30rem] max-w-full p-5 pt-4 gap-4">
          <DialogTitle className="cm-title">ショートカットを編集</DialogTitle>

          <FieldOption name="名前" type="name" state={[form, setForm]} />
          <FieldOption name="URL" type="link" state={[form, setForm]} />
          <FieldOption name="アイコン URL（任意）" type="icon" state={[form, setForm]} />

          <div className="flex justify-end items-center gap-2 pt-1">
            <Button
              onClick={() => {
                set(false);
                clear();
              }}
              className="cm-text-btn"
            >
              キャンセル
            </Button>
            <Button
              disabled={!filled()}
              onClick={() => filled() && action()}
              className="cm-filled-btn"
            >
              保存
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default EditQuickLink;
