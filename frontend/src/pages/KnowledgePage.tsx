import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Search, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useKnowledgeStore } from '../store/knowledgeStore';

export const KnowledgePage: React.FC = () => {
  const { documents, isLoading, isUploading, uploadError, fetchDocuments, uploadFile, deleteDocument } = useKnowledgeStore();
  const [dragOver, setDragOver] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await uploadFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, top_k: 4 }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Semantic search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.filename.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-background p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Personal Knowledge Base</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload files to build your personal RAG vector library. All documents are chunked and indexed locally.
          </p>
        </div>

        <button
          onClick={() => fetchDocuments()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-secondary/40 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Drag & Drop Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border/80 hover:border-primary/50 bg-card/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept=".pdf,.txt,.md,.docx,.csv"
        />
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          {isUploading ? 'Ingesting & Indexing Document...' : 'Drop files here or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports PDF, TXT, Markdown, DOCX, CSV up to 25MB
        </p>

        {uploadError && (
          <div className="mt-3 p-2 bg-destructive/10 text-destructive text-xs rounded-md flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}
      </div>

      {/* Semantic Search Box */}
      <div className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Semantic Knowledge Search
        </h3>
        <form onSubmit={handleSemanticSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Test vector retrieval across all indexed documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="text-[11px] font-medium text-muted-foreground">
              Top Matches ({searchResults.length}):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {searchResults.map((r, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs space-y-1">
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span>{r.filename}</span>
                    <span className="text-[10px] font-mono text-primary">Score: {Math.round(r.score * 100)}%</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-3 leading-relaxed">
                    "{r.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Library Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Indexed Documents ({documents.length})
          </h3>
          <div className="w-56">
            <input
              type="text"
              placeholder="Filter files..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded-md bg-secondary/50 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground bg-card/20 rounded-xl border border-border/40">
            No documents found. Drag and drop a file above to index it.
          </div>
        ) : (
          <div className="border border-border/60 rounded-xl overflow-hidden bg-card/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 border-b border-border/60 text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-4">Filename</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Chunks</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate max-w-xs">{doc.filename}</span>
                    </td>
                    <td className="py-3 px-3 uppercase font-mono text-[10px] text-muted-foreground">
                      {doc.file_type}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px]">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-3 font-mono text-foreground font-medium">
                      {doc.chunks_count || 0}
                    </td>
                    <td className="py-3 px-3">
                      {doc.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      )}
                      {doc.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> Indexing
                        </span>
                      )}
                      {doc.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium" title={doc.error_message}>
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                        title="Delete document and purge vectors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
