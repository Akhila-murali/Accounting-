import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table';
import {
  ClipboardPaste,
  Minus,
  Plus,
  Redo2,
  Settings2,
  Undo2,
} from 'lucide-react';
import Button from '../common/Button.jsx';

import TermsConditionsPanel from '../common/bills/TermsConditionsPanel.jsx';


export default function QuotationBlockEditor({
  block,
  onChange,
  readOnly = false,
  termsHeaderActions,
  isTermsOpen = true,
}) {
  const [method, setMethod] = useState('');

  const isTable = block.type === 'Table';

 const editor = useEditor({
  editable: !readOnly,
  extensions: [
    StarterKit,

    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),

    Table.configure({
      resizable: true,
    }),

    TableRow,
    TableHeader,
    TableCell,
  ],

  content:
    block.content ||
    (block.type === 'Heading'
      ? '<h1></h1>'
      : '<p></p>'),

  onUpdate: ({ editor }) => {
    if (!readOnly) onChange(editor.getHTML());
  },
});


  if (block.type === 'terms') {
    return (
      <TermsConditionsPanel
        selectedTerms={block.terms}
        onTermsChange={(selectedTerms) =>
          onChange(block.content, selectedTerms)
        }
        readOnly={readOnly}
        headerActions={termsHeaderActions}
        isOpen={isTermsOpen}
      />
    );
  }


  if (!editor) {
    return null;
  }


  const table = editor.state.doc.content.content.find(
    (node) => node.type.name === 'table'
  );
  const hasTable = Boolean(table);

  const tableRows = table?.childCount || 0;
  const tableColumns = table?.firstChild?.childCount || 0;

  const saveTableChange = (changeTable) => {
    changeTable();
    onChange(editor.getHTML());
  };

  const createTable = (withHeader) => {
    saveTableChange(() => {
      editor
        .chain()
        .focus()
        .clearContent()
        .insertTable({
          rows: withHeader ? 2 : 1,
          cols: 1,
          withHeaderRow: withHeader,
        })
        .run();
    });
  };

  const pasteTable = (event) => {
    const html = event.clipboardData.getData('text/html');

    // Real HTML tables are handled by TipTap.
    if (html.toLowerCase().includes('<table')) {
      return;
    }

    const text = event.clipboardData
      .getData('text/plain')
      .trim();

    const looksLikeTable =
      text.includes('\t') || text.includes('\n');

    if (!looksLikeTable) {
      return;
    }

    event.preventDefault();


    const escapeHtml = (value) => {
      return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
    };


    const rows = text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((row) => row.split('\t'));


    const rowsHtml = rows
      .map((row) => {
        const cellsHtml = row
          .map((cell) => {
            return `<td><p>${escapeHtml(cell)}</p></td>`;
          })
          .join('');

        return `<tr>${cellsHtml}</tr>`;
      })
      .join('');


    const tableHtml = `
      <table>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    editor.commands.setContent(tableHtml);
    onChange(editor.getHTML());
  };


  if (isTable && !hasTable) {
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
        <div className="mb-4">
          <h4 className="m-0 text-sm font-bold text-stone-800">
            Create a table
          </h4>

          <p className="m-0 mt-1 text-[11px] text-stone-500">
            Paste an existing table or start with one cell.
          </p>
        </div>


        {!method ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <Button variant="unstyled"
              type="button"
              onClick={() => setMethod('paste')}
              className="text-left rounded-xl border border-stone-200 bg-white p-4 cursor-pointer hover:border-[#c5a059] hover:bg-[#fbf5e7]/25"
            >
              <ClipboardPaste
                size={19}
                className="text-[#8c6723]"
              />

              <strong className="block mt-3 text-xs text-stone-800">
                Paste table
              </strong>

              <span className="block mt-1 text-[10px] text-stone-500">
                Copy from Word or Excel and paste it here.
              </span>
            </Button>


            <Button variant="unstyled"
              type="button"
              onClick={() => setMethod('manual')}
              className="text-left rounded-xl border border-stone-200 bg-white p-4 cursor-pointer hover:border-[#c5a059] hover:bg-[#fbf5e7]/25"
            >
              <Settings2
                size={19}
                className="text-[#8c6723]"
              />

              <strong className="block mt-3 text-xs text-stone-800">
                Create manually
              </strong>

              <span className="block mt-1 text-[10px] text-stone-500">
                Start with one cell, then use + and −.
              </span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {method === 'manual' ? (
              <div>
                <p className="m-0 mb-2 text-[11px] font-semibold text-stone-600">
                  Choose table style
                </p>

                <div className="grid sm:grid-cols-2 gap-2">
                  <Button variant="unstyled"
                    type="button"
                    onClick={() => createTable(true)}
                    className="text-left rounded-lg border border-stone-200 bg-white p-3 cursor-pointer hover:border-[#c5a059] hover:bg-[#fbf5e7]"
                  >
                    <strong className="block text-xs text-stone-800">
                      With header
                    </strong>

                    <span className="text-[10px] text-stone-500">
                      One header cell
                    </span>
                  </Button>


                  <Button variant="unstyled"
                    type="button"
                    onClick={() => createTable(false)}
                    className="text-left rounded-lg border border-stone-200 bg-white p-3 cursor-pointer hover:border-[#c5a059] hover:bg-[#fbf5e7]"
                  >
                    <strong className="block text-xs text-stone-800">
                      Without header
                    </strong>

                    <span className="text-[10px] text-stone-500">
                      One standard cell
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onPaste={pasteTable}
                className="rounded-lg border-2 border-dashed border-stone-300 bg-white p-3 focus-within:border-[#c5a059]"
              >
                <p className="m-0 mb-2 text-[10px] text-stone-500">
                  Click below, then paste your copied Word or Excel table.
                </p>

                <EditorContent
                  editor={editor}
                  className="quotation-editor quotation-paste-editor"
                />
              </div>
            )}


            <Button variant="unstyled"
              type="button"
              onClick={() => setMethod('')}
              className="border-0 bg-transparent p-0 text-[11px] text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              ← Back
            </Button>
          </div>
        )}
      </div>
    );
  }


  return (
    <div
      className={
        isTable
          ? 'quotation-table-editor relative pr-9 pb-9'
          : ''
      }
    >
      {!readOnly && <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-stone-200 bg-stone-50 px-2 py-1.5">
        <Button variant="unstyled"
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          className="rounded-md border-0 bg-transparent p-1.5 text-stone-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
        >
          <Undo2 size={15} />
        </Button>
        <Button variant="unstyled"
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          className="rounded-md border-0 bg-transparent p-1.5 text-stone-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
        >
          <Redo2 size={15} />
        </Button>
      </div>}
      <EditorContent
        editor={editor}
        className={`quotation-editor ${block.type === 'Paragraph' ? 'quotation-paragraph-editor' : ''}`}
      />
      {isTable && !readOnly && (
        <>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
            <Button variant="unstyled"
              type="button"
              onClick={() => saveTableChange(() => editor.chain().focus().addColumnAfter().run())}
              title="Add column"
              className="quotation-table-control"
            >
              <Plus size={14} />
            </Button>

            <Button variant="unstyled"
              type="button"
              disabled={tableColumns <= 1}
              onClick={() => saveTableChange(() => editor.chain().focus().deleteColumn().run())}
              title="Remove column"
              className="quotation-table-control disabled:opacity-40"
            >
              <Minus size={14} />
            </Button>
          </div>


          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5">
            <Button variant="unstyled"
              type="button"
              onClick={() => saveTableChange(() => editor.chain().focus().addRowAfter().run())}
              title="Add row"
              className="quotation-table-control"
            >
              <Plus size={14} />
            </Button>

            <Button variant="unstyled"
              type="button"
              disabled={tableRows <= 1}
              onClick={() => saveTableChange(() => editor.chain().focus().deleteRow().run())}
              title="Remove row"
              className="quotation-table-control disabled:opacity-40"
            >
              <Minus size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
